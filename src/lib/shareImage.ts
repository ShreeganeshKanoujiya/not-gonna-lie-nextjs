/**
 * Share-card rendering.
 *
 * The editor previews the scene as DOM (cheap to drag and resize, responsive,
 * selectable text) but exports through a 1080x1920 canvas. Both are driven from
 * the single `ShareScene` below, and every measurement in the canvas pass is
 * expressed as a fraction of the card's own width, so the PNG matches the
 * preview at any viewport size or card size rather than drifting from it.
 */

export const EXPORT_WIDTH = 1080;
export const EXPORT_HEIGHT = 1920;
export const ASPECT_RATIO = 9 / 16;

/** Card width, as a fraction of the canvas width. */
export const MIN_CARD_WIDTH = 0.45;
export const MAX_CARD_WIDTH = 1.0;
export const DEFAULT_CARD_WIDTH = 0.90;

/**
 * Tallest the card may get, as a fraction of the canvas height. Leaves room for
 * the footer and a margin so a long reply cannot run off the top and bottom.
 */
export const MAX_CARD_HEIGHT = 0.80;

/**
 * How far the type may be scaled down to make long content fit, once widening
 * the card has run out. Messages can be 1000 characters, which no card width
 * alone can accommodate in a 9:16 frame.
 */
export const MIN_TEXT_SCALE = 0.42;

export type ShareBackground =
  | { kind: "gradient"; id: string }
  | { kind: "image"; src: string };

export type ShareScene = {
  /** The reply the user writes — the white panel under the message. */
  reply: string;
  /** The anonymous message being shared — the coloured band on top. */
  message: string;
  /** Card centre, as a fraction of the canvas (0..1). */
  cardX: number;
  cardY: number;
  /** Card width, as a fraction of the canvas width. */
  cardWidth: number;
  background: ShareBackground;
};

export type GradientPreset = {
  id: string;
  label: string;
  /** Top-left to bottom-right colour stops. */
  from: string;
  to: string;
  /** Message band colours, picked to carry white text. */
  bandFrom: string;
  bandTo: string;
};

/**
 * Backdrops in the app's palette, plus the pink/orange that reads as "anonymous
 * message card" to anyone who has seen one before.
 */
export const GRADIENT_PRESETS: GradientPreset[] = [
  { id: "sunset", label: "Sunset", from: "#ff3d77", to: "#ff9d3d", bandFrom: "#ff3d77", bandTo: "#ff9d3d" },
  { id: "coral", label: "Coral", from: "#e95776", to: "#b23a1a", bandFrom: "#e95776", bandTo: "#b23a1a" },
  { id: "ink", label: "Ink", from: "#2f4858", to: "#1e1c1a", bandFrom: "#2f4858", bandTo: "#1e1c1a" },
  { id: "matcha", label: "Matcha", from: "#c8f24a", to: "#2f4858", bandFrom: "#2f4858", bandTo: "#1e1c1a" },
  { id: "washi", label: "Washi", from: "#ede7d9", to: "#c9bfa6", bandFrom: "#1e1c1a", bandTo: "#2f4858" },
  { id: "violet", label: "Violet", from: "#7063ff", to: "#e95776", bandFrom: "#7063ff", bandTo: "#e95776" },
];

export const DEFAULT_GRADIENT = GRADIENT_PRESETS[0];

export function findGradient(id: string): GradientPreset {
  return GRADIENT_PRESETS.find((preset) => preset.id === id) ?? DEFAULT_GRADIENT;
}

/** CSS gradient for the DOM preview — mirrors the canvas pass below. */
export function gradientCss(preset: GradientPreset): string {
  return `linear-gradient(150deg, ${preset.from} 0%, ${preset.to} 100%)`;
}

export function bandCss(preset: GradientPreset): string {
  return `linear-gradient(100deg, ${preset.bandFrom} 0%, ${preset.bandTo} 100%)`;
}

export function clampCardWidth(width: number): number {
  return Math.min(MAX_CARD_WIDTH, Math.max(MIN_CARD_WIDTH, width));
}

/**
 * Keeps the card fully on the canvas. Half the card's width/height in fractional
 * units, so the centre can never travel past the edge. A card larger than the
 * canvas would invert the bounds, so those cases pin to the centre instead.
 */
export function clampCardPosition(
  x: number,
  y: number,
  cardHeightRatio: number,
  cardWidthRatio: number
): { x: number; y: number } {
  const halfW = cardWidthRatio / 2;
  const halfH = cardHeightRatio / 2;
  return {
    x: halfW * 2 >= 1 ? 0.5 : Math.min(1 - halfW, Math.max(halfW, x)),
    y: halfH * 2 >= 1 ? 0.5 : Math.min(1 - halfH, Math.max(halfH, y)),
  };
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

/** Greedy word wrap. Returns the lines that fit `maxWidth`. */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const lines: string[] = [];

  for (const paragraph of text.split("\n")) {
    const words = paragraph.split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      lines.push("");
      continue;
    }

    let line = words[0];
    for (const word of words.slice(1)) {
      if (ctx.measureText(`${line} ${word}`).width <= maxWidth) {
        line = `${line} ${word}`;
      } else {
        lines.push(line);
        line = word;
      }
    }
    lines.push(line);
  }

  return lines;
}

/**
 * `cover` geometry — the same thing CSS `background-size: cover` computes, so a
 * chosen photo frames identically in the preview and the export.
 */
export function coverRect(
  imageWidth: number,
  imageHeight: number,
  boxWidth: number,
  boxHeight: number
) {
  const scale = Math.max(boxWidth / imageWidth, boxHeight / imageHeight);
  const width = imageWidth * scale;
  const height = imageHeight * scale;
  return {
    x: (boxWidth - width) / 2,
    y: (boxHeight - height) / 2,
    width,
    height,
  };
}

export async function loadImage(src: string): Promise<HTMLImageElement> {
  const image = new Image();

  // Only meaningful for remote URLs. Setting it on a blob:/data: URL makes some
  // mobile browsers (notably iOS Safari) fail the load outright, which is why a
  // photo picked on a phone could refuse to render.
  if (/^https?:/i.test(src)) {
    image.crossOrigin = "anonymous";
  }

  image.src = src;

  try {
    if (typeof image.decode === "function") {
      // decode() surfaces codec failures that onload alone can hide, and
      // resolves only once the pixels are actually ready to draw.
      await image.decode();
    } else {
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error("load failed"));
      });
    }
  } catch {
    throw new Error(
      "That photo could not be decoded. iPhone HEIC photos usually need to be saved as JPEG first."
    );
  }

  if (!image.naturalWidth || !image.naturalHeight) {
    throw new Error("That photo could not be decoded.");
  }

  return image;
}

export type CardFit = {
  /** Card width actually used, as a fraction of the canvas width. */
  widthRatio: number;
  /** Type scale applied on top of the width, 1 when nothing had to shrink. */
  textScale: number;
  /** Card height, as a fraction of the canvas height. */
  heightRatio: number;
};

type FitInput = {
  message: string;
  reply: string;
  cardWidth: number;
  displayFont: string;
  bodyFont: string;
};

/** A throwaway context used only for text measurement. */
let measureContext: CanvasRenderingContext2D | null = null;
function getMeasureContext(): CanvasRenderingContext2D | null {
  if (typeof document === "undefined") return null;
  if (!measureContext) {
    measureContext = document.createElement("canvas").getContext("2d");
  }
  return measureContext;
}

function measureCard(
  ctx: CanvasRenderingContext2D,
  input: FitInput,
  widthRatio: number,
  textScale: number
) {
  const width = EXPORT_WIDTH * widthRatio;
  const messageFontSize = width * 0.088 * textScale;
  const replyFontSize = width * 0.096 * textScale;
  // Padding follows the type rather than the card, so it matches the `em`
  // padding the DOM preview uses and stays proportionate as text scales.
  const padding = messageFontSize * 0.97;
  const innerWidth = width - padding * 2;

  if (innerWidth <= 0) {
    return null;
  }

  ctx.font = `700 ${messageFontSize}px ${input.bodyFont}`;
  const messageLines = wrapText(ctx, input.message, innerWidth);

  ctx.font = `700 ${replyFontSize}px ${input.displayFont}`;
  const replyText = input.reply.trim();
  const replyLines = replyText ? wrapText(ctx, replyText, innerWidth) : [];

  const messageHeight = messageLines.length * messageLineHeightFor(messageFontSize) + padding * 1.6;
  const replyHeight =
    replyLines.length > 0
      ? replyLines.length * replyLineHeightFor(replyFontSize) + padding * 1.5
      : 0;

  return {
    width,
    padding,
    radius: width * 0.075,
    messageFontSize,
    replyFontSize,
    messageLineHeight: messageLineHeightFor(messageFontSize),
    replyLineHeight: replyLineHeightFor(replyFontSize),
    messageLines,
    replyLines,
    messageHeight,
    replyHeight,
    cardHeight: messageHeight + replyHeight,
  };
}

const messageLineHeightFor = (size: number) => size * 1.38;
const replyLineHeightFor = (size: number) => size * 1.22;

/**
 * Works out the card width and type scale that keep the content inside the
 * frame. Shared by the canvas export and the DOM preview, so the two cannot
 * disagree about how a long message is laid out.
 *
 * Stage 1 widens the card while holding the absolute type size, which fits more
 * words per line and so needs fewer lines. Stage 2 scales the type down, for
 * content no width can accommodate — messages go up to 1000 characters.
 */
export function fitCard(input: FitInput): CardFit {
  const ctx = getMeasureContext();
  const startWidth = clampCardWidth(input.cardWidth);

  if (!ctx) {
    return { widthRatio: startWidth, textScale: 1, heightRatio: 0.3 };
  }

  const maxHeight = EXPORT_HEIGHT * MAX_CARD_HEIGHT;
  let widthRatio = startWidth;
  let textScale = 1;
  let metrics = measureCard(ctx, input, widthRatio, textScale);
  if (!metrics) {
    return { widthRatio, textScale, heightRatio: 0.3 };
  }

  if (metrics.cardHeight > maxHeight && widthRatio < MAX_CARD_WIDTH) {
    textScale *= widthRatio / MAX_CARD_WIDTH;
    widthRatio = MAX_CARD_WIDTH;
    metrics = measureCard(ctx, input, widthRatio, textScale) ?? metrics;
  }

  for (let pass = 0; pass < 6 && metrics.cardHeight > maxHeight; pass += 1) {
    const next = Math.max(
      MIN_TEXT_SCALE,
      textScale * Math.sqrt(maxHeight / metrics.cardHeight)
    );
    if (next >= textScale) break;
    textScale = next;
    metrics = measureCard(ctx, input, widthRatio, textScale) ?? metrics;
  }

  return {
    widthRatio,
    textScale,
    heightRatio: metrics.cardHeight / EXPORT_HEIGHT,
  };
}

type RenderOptions = {
  scene: ShareScene;
  /** Resolved font stacks, read off the DOM so next/font's family names are used. */
  displayFont: string;
  bodyFont: string;
  /** Pre-loaded background image, when the scene uses one. */
  backgroundImage?: HTMLImageElement | null;
};

/**
 * Draws the scene at export resolution and returns the canvas.
 *
 * Card layout is the message on a coloured band, then the reply on white
 * beneath it.
 */
export function renderShareCanvas({
  scene,
  displayFont,
  bodyFont,
  backgroundImage,
}: RenderOptions): {
  canvas: HTMLCanvasElement;
  cardHeightRatio: number;
  /** The width actually used, after fitting. May be below `scene.cardWidth`. */
  cardWidth: number;
} {
  const canvas = document.createElement("canvas");
  canvas.width = EXPORT_WIDTH;
  canvas.height = EXPORT_HEIGHT;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas is not available in this browser.");
  }

  const preset =
    scene.background.kind === "gradient"
      ? findGradient(scene.background.id)
      : DEFAULT_GRADIENT;

  // --- Background -------------------------------------------------------
  if (scene.background.kind === "image" && backgroundImage) {
    const rect = coverRect(
      backgroundImage.naturalWidth,
      backgroundImage.naturalHeight,
      EXPORT_WIDTH,
      EXPORT_HEIGHT
    );
    ctx.drawImage(backgroundImage, rect.x, rect.y, rect.width, rect.height);
    // A photo can be busy anywhere; this keeps the white card readable without
    // washing the picture out.
    ctx.fillStyle = "rgba(30,28,26,0.28)";
    ctx.fillRect(0, 0, EXPORT_WIDTH, EXPORT_HEIGHT);
  } else {
    const gradient = ctx.createLinearGradient(0, 0, EXPORT_WIDTH, EXPORT_HEIGHT);
    gradient.addColorStop(0, preset.from);
    gradient.addColorStop(1, preset.to);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, EXPORT_WIDTH, EXPORT_HEIGHT);
  }

  // --- Card metrics -----------------------------------------------------
  const fit = fitCard({
    message: scene.message,
    reply: scene.reply,
    cardWidth: scene.cardWidth,
    displayFont,
    bodyFont,
  });
  const widthRatio = fit.widthRatio;
  const metrics = measureCard(
    ctx,
    { message: scene.message, reply: scene.reply, cardWidth: scene.cardWidth, displayFont, bodyFont },
    widthRatio,
    fit.textScale
  );
  if (!metrics) {
    throw new Error("Could not lay out the card.");
  }

  const {
    width: cardWidth,
    radius,
    messageFontSize,
    replyFontSize,
    messageLineHeight,
    replyLineHeight,
    messageLines,
    replyLines,
    messageHeight,
    replyHeight,
    cardHeight,
  } = metrics;

  const cardHeightRatio = cardHeight / EXPORT_HEIGHT;

  const clamped = clampCardPosition(
    scene.cardX,
    scene.cardY,
    cardHeightRatio,
    widthRatio
  );
  const cardX = clamped.x * EXPORT_WIDTH - cardWidth / 2;
  const cardY = clamped.y * EXPORT_HEIGHT - cardHeight / 2;

  // --- Card -------------------------------------------------------------
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.30)";
  ctx.shadowBlur = cardWidth * 0.09;
  ctx.shadowOffsetY = cardWidth * 0.035;
  ctx.fillStyle = "#ffffff";
  roundedRect(ctx, cardX, cardY, cardWidth, cardHeight, radius);
  ctx.fill();
  ctx.restore();

  // Coloured message band on top, clipped so the card's corners stay rounded.
  ctx.save();
  roundedRect(ctx, cardX, cardY, cardWidth, cardHeight, radius);
  ctx.clip();
  const band = ctx.createLinearGradient(
    cardX,
    cardY,
    cardX + cardWidth,
    cardY + messageHeight
  );
  band.addColorStop(0, preset.bandFrom);
  band.addColorStop(1, preset.bandTo);
  ctx.fillStyle = band;
  ctx.fillRect(cardX, cardY, cardWidth, messageHeight);
  ctx.restore();

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Message, on the colour
  ctx.font = `700 ${messageFontSize}px ${bodyFont}`;
  ctx.fillStyle = "#ffffff";
  const messageBlockHeight = messageLines.length * messageLineHeight;
  let textY = cardY + messageHeight / 2 - messageBlockHeight / 2 + messageLineHeight / 2;
  for (const line of messageLines) {
    ctx.fillText(line, cardX + cardWidth / 2, textY);
    textY += messageLineHeight;
  }

  // Reply, on the white
  if (replyHeight > 0) {
    ctx.font = `700 ${replyFontSize}px ${displayFont}`;
    ctx.fillStyle = "#1e1c1a";
    const replyBlockHeight = replyLines.length * replyLineHeight;
    textY = cardY + messageHeight + replyHeight / 2 - replyBlockHeight / 2 + replyLineHeight / 2;
    for (const line of replyLines) {
      ctx.fillText(line, cardX + cardWidth / 2, textY);
      textY += replyLineHeight;
    }
  }

  // --- Footer -----------------------------------------------------------
  ctx.font = `500 ${EXPORT_WIDTH * 0.028}px ${bodyFont}`;
  ctx.fillStyle = "rgba(255,255,255,0.88)";
  ctx.fillText("Not Gonna Lie", EXPORT_WIDTH / 2, EXPORT_HEIGHT - EXPORT_WIDTH * 0.075);

  return { canvas, cardHeightRatio, cardWidth: widthRatio };
}

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Could not create the image."));
    }, "image/png");
  });
}
