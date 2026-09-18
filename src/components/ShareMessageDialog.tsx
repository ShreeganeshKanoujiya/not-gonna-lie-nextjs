'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  Download,
  ImagePlus,
  Loader2,
  Maximize2,
  Move,
  Palette,
  Trash2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ASPECT_RATIO,
  DEFAULT_CARD_WIDTH,
  DEFAULT_GRADIENT,
  GRADIENT_PRESETS,
  MAX_CARD_WIDTH,
  MIN_CARD_WIDTH,
  type ShareBackground,
  type ShareScene,
  bandCss,
  canvasToBlob,
  clampCardPosition,
  clampCardWidth,
  findGradient,
  fitCard,
  gradientCss,
  loadImage,
  renderShareCanvas,
} from '@/lib/shareImage';

const MAX_IMAGE_BYTES = 25 * 1024 * 1024;
const REPLY_LIMIT = 80;
const DEFAULT_REPLY = 'send me anonymous messages!';

type ShareMessageDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message: string;
};

/**
 * Editor state lives here rather than in the dialog wrapper. Base UI unmounts
 * the popup subtree on close, so every open starts from a clean slate without
 * an effect resetting things by hand.
 */
function ShareComposer({ message }: { message: string }) {
  const [reply, setReply] = useState('');
  const [background, setBackground] = useState<ShareBackground>({
    kind: 'gradient',
    id: DEFAULT_GRADIENT.id,
  });
  const [position, setPosition] = useState({ x: 0.5, y: 0.5 });
  const [cardWidth, setCardWidth] = useState(DEFAULT_CARD_WIDTH);
  const [fonts, setFonts] = useState({ display: 'serif', body: 'sans-serif' });
  // Kept so the user can open the result by hand when the browser ignores the
  // download attribute, which iOS Safari does.
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const resultUrlRef = useRef<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Offset between the pointer and the card centre at grab time, so the card
  // does not jump to centre itself under the cursor on the first move.
  const grabOffset = useRef({ x: 0, y: 0 });
  const objectUrlRef = useRef<string | null>(null);

  /**
   * Reads the resolved font stacks off the DOM. next/font generates hashed
   * family names, so they cannot be hard-coded, and the fit has to wrap with the
   * same faces the canvas will draw with.
   */
  const captureFonts = useCallback((node: HTMLDivElement | null) => {
    cardRef.current = node;
    if (!node) return;
    const body = getComputedStyle(node).fontFamily;
    const displayNode = node.querySelector('[data-share-display]');
    const display = displayNode ? getComputedStyle(displayNode).fontFamily : body;
    setFonts((current) =>
      current.body === body && current.display === display ? current : { display, body }
    );
  }, []);

  /**
   * The single source of truth for card size. The exporter runs the very same
   * function, so the PNG cannot lay out differently from the preview.
   */
  const fit = useMemo(
    () =>
      fitCard({
        message,
        reply,
        cardWidth,
        displayFont: fonts.display,
        bodyFont: fonts.body,
      }),
    [message, reply, cardWidth, fonts.display, fonts.body]
  );

  const preset = useMemo(
    () => (background.kind === 'gradient' ? findGradient(background.id) : DEFAULT_GRADIENT),
    [background]
  );

  const releaseObjectUrl = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  const releaseResultUrl = useCallback(() => {
    if (resultUrlRef.current) {
      URL.revokeObjectURL(resultUrlRef.current);
      resultUrlRef.current = null;
    }
  }, []);

  // Object URLs outlive the component unless revoked, so drop them when the
  // dialog unmounts.
  useEffect(
    () => () => {
      releaseObjectUrl();
      releaseResultUrl();
    },
    [releaseObjectUrl, releaseResultUrl]
  );

  const moveCardTo = useCallback(
    (clientX: number, clientY: number) => {
      const stage = stageRef.current;
      if (!stage) return;
      const bounds = stage.getBoundingClientRect();
      const x = (clientX - bounds.left) / bounds.width - grabOffset.current.x;
      const y = (clientY - bounds.top) / bounds.height - grabOffset.current.y;
      setPosition(clampCardPosition(x, y, fit.heightRatio, fit.widthRatio));
    },
    [fit.heightRatio, fit.widthRatio]
  );

  /**
   * Resizing keeps the card centred on its current position and grows outward,
   * so the grip does not drag the card around while it scales.
   */
  const resizeFromPointer = useCallback(
    (clientX: number) => {
      const stage = stageRef.current;
      if (!stage) return;
      const bounds = stage.getBoundingClientRect();
      const pointerX = (clientX - bounds.left) / bounds.width;
      setCardWidth(clampCardWidth(Math.abs(pointerX - position.x) * 2));
    },
    [position.x]
  );

  const handleResizePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsResizing(true);
  };

  const handleResizePointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!isResizing) return;
    event.preventDefault();
    event.stopPropagation();
    resizeFromPointer(event.clientX);
  };

  const endResize = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!isResizing) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setIsResizing(false);
  };

  const applyCardWidth = useCallback(
    (next: number) => setCardWidth(clampCardWidth(next)),
    []
  );

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const stage = stageRef.current;
    const card = cardRef.current;
    if (!stage || !card) return;

    const stageBounds = stage.getBoundingClientRect();
    const cardBounds = card.getBoundingClientRect();
    const cardCentreX = (cardBounds.left + cardBounds.width / 2 - stageBounds.left) / stageBounds.width;
    const cardCentreY = (cardBounds.top + cardBounds.height / 2 - stageBounds.top) / stageBounds.height;

    grabOffset.current = {
      x: (event.clientX - stageBounds.left) / stageBounds.width - cardCentreX,
      y: (event.clientY - stageBounds.top) / stageBounds.height - cardCentreY,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    // Stops the page from scrolling under the finger while dragging on a phone.
    event.preventDefault();
    moveCardTo(event.clientX, event.clientY);
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setIsDragging(false);
  };

  // Keyboard equivalent of dragging, so the card is positionable without a mouse.
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? 0.05 : 0.01;
    const deltas: Record<string, [number, number]> = {
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
    };
    if (event.key === '+' || event.key === '=') {
      event.preventDefault();
      applyCardWidth(cardWidth + 0.04);
      return;
    }
    if (event.key === '-' || event.key === '_') {
      event.preventDefault();
      applyCardWidth(cardWidth - 0.04);
      return;
    }

    const delta = deltas[event.key];
    if (!delta) return;
    event.preventDefault();
    setPosition((current) =>
      clampCardPosition(current.x + delta[0], current.y + delta[1], fit.heightRatio, fit.widthRatio)
    );
  };

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('That file is not an image.');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error('That image is too large.', { description: 'Pick one under 25 MB.' });
      return;
    }

    releaseObjectUrl();
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setBackground({ kind: 'image', src: url });
  };

  const download = async () => {
    setIsDownloading(true);
    try {
      // Without this the first export can fall back to a system font.
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }

      const backgroundImage =
        background.kind === 'image' ? await loadImage(background.src) : null;

      const scene: ShareScene = {
        // Passed through as-is: an empty reply means no band, in the export
        // exactly as in the preview.
        reply: reply.trim(),
        message,
        cardX: position.x,
        cardY: position.y,
        cardWidth,
        background,
      };

      const { canvas } = renderShareCanvas({
        scene,
        displayFont: fonts.display,
        bodyFont: fonts.body,
        backgroundImage,
      });
      const blob = await canvasToBlob(canvas);

      const fileName = `not-gonna-lie-${Date.now()}.png`;

      // 1. Native share sheet — much better than a download on a phone, and it
      //    drops the file straight into Instagram/WhatsApp. Requires a secure
      //    context, so it is unavailable over a plain http:// LAN address.
      const file = new File([blob], fileName, { type: 'image/png' });
      if (typeof navigator !== 'undefined' && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: 'Not Gonna Lie' });
          return;
        } catch (shareError) {
          // Cancelling the sheet is not a failure; anything else falls through
          // to the download below.
          if ((shareError as DOMException)?.name === 'AbortError') return;
        }
      }

      // 2. Download. The object URL is deliberately NOT revoked straight away:
      //    on mobile the transfer has not necessarily started by the time the
      //    click handler returns, and revoking early cancels it.
      releaseResultUrl();
      const url = URL.createObjectURL(blob);
      resultUrlRef.current = url;
      setResultUrl(url);

      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = fileName;
      anchor.rel = 'noopener';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      toast.success('Image ready', {
        description: '1080 × 1920. If it did not save, use the link below.',
      });
    } catch (error) {
      toast.error('Could not create the image', {
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const stageBackground =
    background.kind === 'image'
      ? { backgroundImage: `url(${background.src})`, backgroundSize: 'cover', backgroundPosition: 'center' }
      : { backgroundImage: gradientCss(preset) };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 sm:flex-row sm:gap-6 sm:p-6">
          {/* Stage — always exactly 9:16 */}
          <div className="flex min-h-0 flex-1 items-center justify-center">
            <div
              ref={stageRef}
              style={{ aspectRatio: String(ASPECT_RATIO), ...stageBackground }}
              className="relative h-[min(58svh,32rem)] max-h-full w-auto max-w-full touch-none overflow-hidden rounded-2xl shadow-[0_16px_40px_rgba(30,28,26,0.24)] [container-type:size] sm:h-[min(64svh,36rem)]"
            >
              {background.kind === 'image' && (
                <div className="pointer-events-none absolute inset-0 bg-sumi/28" />
              )}

              <div
                ref={captureFonts}
                role="button"
                tabIndex={0}
                aria-label="Message card. Drag to move, or use the arrow keys."
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                onKeyDown={handleKeyDown}
                style={{
                  left: `${position.x * 100}%`,
                  top: `${position.y * 100}%`,
                  width: `${fit.widthRatio * 100}%`,
                  // Same two numbers the exporter uses, so the preview and the
                  // PNG lay out identically.
                  fontSize: `${fit.widthRatio * fit.textScale * 11.3}cqw`,
                }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 select-none rounded-[1.1rem] bg-white shadow-[0_10px_28px_rgba(0,0,0,0.3)] outline-none ring-offset-2 transition-shadow focus-visible:ring-3 focus-visible:ring-white ${
                  isDragging ? 'cursor-grabbing shadow-[0_16px_40px_rgba(0,0,0,0.42)]' : 'cursor-grab'
                }`}
              >
                <div className="overflow-hidden rounded-[1.1rem]">
                  <p
                    style={{ backgroundImage: bandCss(preset) }}
                    className="break-words px-[0.9em] py-[0.85em] text-center text-[0.88em] font-bold leading-snug text-white"
                  >
                    {message}
                  </p>
                  {reply.trim() ? (
                    <div
                      data-share-display
                      className="break-words bg-white px-[0.9em] py-[0.8em] text-center font-display text-[0.96em] font-bold leading-tight text-sumi"
                    >
                      {reply.trim()}
                    </div>
                  ) : (
                    // Keeps a display-font node mounted so the font probe and the
                    // exporter can always resolve the family.
                    <span data-share-display className="sr-only font-display" aria-hidden="true">
                      reply
                    </span>
                  )}
                </div>

                {/* Outside the clipped wrapper so it can straddle the corner. */}
                <button
                  type="button"
                  aria-label="Resize card"
                  onPointerDown={handleResizePointerDown}
                  onPointerMove={handleResizePointerMove}
                  onPointerUp={endResize}
                  onPointerCancel={endResize}
                  className={`absolute -bottom-2.5 -right-2.5 grid size-7 cursor-nwse-resize touch-none place-items-center rounded-full bg-white text-sumi shadow-[0_2px_8px_rgba(0,0,0,0.35)] outline-none transition-transform hover:scale-110 focus-visible:ring-3 focus-visible:ring-white ${
                    isResizing ? 'scale-110' : ''
                  }`}
                >
                  <Maximize2 className="size-3.5" />
                </button>
              </div>

              <p className="pointer-events-none absolute inset-x-0 bottom-3 text-center text-[0.6rem] font-medium text-white/85">
                Not Gonna Lie
              </p>

              {!isDragging && !isResizing && (
                <div className="pointer-events-none absolute left-1/2 top-3 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-sumi/55 px-2.5 py-1 text-[0.65rem] font-medium text-white backdrop-blur-sm">
                  <Move className="size-3" />
                  Drag to move · corner to resize
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex shrink-0 flex-col gap-4 sm:w-72">
            <div>
              <div className="flex items-baseline justify-between gap-2">
                <label htmlFor="share-reply" className="text-sm font-semibold text-sumi">
                  Your reply <span className="font-normal text-kobicha">(white panel below)</span>
                </label>
                <span className="text-xs tabular-nums text-kobicha">
                  {reply.length}/{REPLY_LIMIT}
                </span>
              </div>
              <textarea
                id="share-reply"
                value={reply}
                maxLength={REPLY_LIMIT}
                onChange={(event) => setReply(event.target.value)}
                rows={2}
                placeholder={DEFAULT_REPLY}
                className="mt-2 w-full resize-none rounded-xl border border-sumi/15 bg-white px-3.5 py-2.5 text-sm text-sumi outline-none placeholder:text-kobicha/55 focus:border-aizome focus:ring-3 focus:ring-aizome/25"
              />
            </div>

            <div>
              <label htmlFor="card-size" className="flex items-center gap-1.5 text-sm font-semibold text-sumi">
                <Maximize2 className="size-3.5 text-coral" />
                Card size
              </label>
              <input
                id="card-size"
                type="range"
                min={MIN_CARD_WIDTH * 100}
                max={MAX_CARD_WIDTH * 100}
                step={1}
                value={Math.round(cardWidth * 100)}
                aria-describedby="card-size-note"
                onChange={(event) => applyCardWidth(Number(event.target.value) / 100)}
                className="mt-2.5 w-full accent-sumi"
              />
              {fit.textScale < 0.995 && (
                <p id="card-size-note" className="mt-1.5 text-xs leading-5 text-kobicha">
                  Long message — the card was widened and the text scaled down to fit.
                </p>
              )}
            </div>

            <div>
              <p className="flex items-center gap-1.5 text-sm font-semibold text-sumi">
                <Palette className="size-3.5 text-coral" />
                Background
              </p>
              <div className="mt-2 grid grid-cols-6 gap-2 sm:grid-cols-3">
                {GRADIENT_PRESETS.map((item) => {
                  const active = background.kind === 'gradient' && background.id === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        releaseObjectUrl();
                        setBackground({ kind: 'gradient', id: item.id });
                      }}
                      aria-label={item.label}
                      aria-pressed={active}
                      style={{ backgroundImage: gradientCss(item) }}
                      className={`grid aspect-square place-items-center rounded-xl outline-none transition-transform hover:-translate-y-0.5 focus-visible:ring-3 focus-visible:ring-aizome/40 sm:aspect-[3/2] ${
                        active ? 'ring-2 ring-sumi ring-offset-2 ring-offset-washi' : ''
                      }`}
                    >
                      {active && <Check className="size-4 text-white drop-shadow" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="h-11 flex-1 gap-2 rounded-xl border-sumi/20 text-sm text-sumi hover:bg-sumi hover:text-washi"
              >
                <ImagePlus className="size-4" />
                {background.kind === 'image' ? 'Change photo' : 'Use a photo'}
              </Button>
              {background.kind === 'image' && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Remove photo"
                  onClick={() => {
                    releaseObjectUrl();
                    setBackground({ kind: 'gradient', id: DEFAULT_GRADIENT.id });
                  }}
                  className="size-11 shrink-0 rounded-xl text-kobicha hover:bg-coral/10 hover:text-coral"
                >
                  <Trash2 className="size-4" />
                </Button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFile}
                className="sr-only"
              />
            </div>

            <Button
              type="button"
              onClick={download}
              disabled={isDownloading}
              className="group mt-auto h-12 w-full gap-2.5 rounded-full bg-sumi text-[0.95rem] text-washi shadow-[0_10px_24px_rgba(30,28,26,0.2)] transition-all hover:-translate-y-0.5 hover:bg-sumi/90 active:translate-y-0 active:scale-[0.98] disabled:translate-y-0"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="size-[1.1rem] animate-spin" />
                  Saving&hellip;
                </>
              ) : (
                <>
                  <Download className="size-[1.1rem]" />
                  Download 9:16 image
                </>
              )}
            </Button>

            {/* iOS Safari ignores the download attribute, and a LAN http:// origin
                is not a secure context so the share sheet is unavailable there
                too. This link always works: open it, then long-press to save. */}
            {resultUrl && !isDownloading && (
              <a
                href={resultUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="-mt-1 text-center text-xs font-semibold text-aizome underline decoration-aizome/35 underline-offset-4 transition-colors hover:text-sumi hover:decoration-sumi"
              >
                Did not save? Open the image, then long-press it
              </a>
            )}
      </div>
    </div>
  );
}

export function ShareMessageDialog({
  open,
  onOpenChange,
  message,
}: ShareMessageDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-label="Share this message">
        <div className="flex items-start justify-between gap-4 border-b border-sumi/10 px-4 py-3.5 sm:px-6 sm:py-4">
          <div className="min-w-0">
            <DialogTitle>Share with a reply</DialogTitle>
            <DialogDescription className="mt-0.5 hidden sm:block">
              Write your reply, drag the card where you want it, then save a 9:16 image.
            </DialogDescription>
          </div>
          <DialogClose
            render={
              <Button
                variant="ghost"
                size="icon"
                aria-label="Close"
                className="size-9 shrink-0 rounded-full text-kobicha hover:bg-sumi/8 hover:text-sumi"
              />
            }
          >
            <X className="size-4" />
          </DialogClose>
        </div>

        <ShareComposer message={message} />
      </DialogContent>
    </Dialog>
  );
}

export default ShareMessageDialog;
