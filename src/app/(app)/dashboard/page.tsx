'use client';

import { MessageCard } from '@/components/MessageCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogEyebrow,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Message } from '@/model/User';
import { ApiResponse } from '@/types/ApiResponse';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosError } from 'axios';
import { Copy, Inbox, Link2, Loader2, MessageCircleMore, RefreshCcw, ShieldCheck, Trash2 } from 'lucide-react';
import { User } from 'next-auth';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { acceptMessageSchema } from '@/schemas/acceptMessageSchema';
import { DashboardSkeleton, MessageCardSkeleton } from '@/components/DashboardSkeleton';

type AcceptMessageFormData = z.infer<typeof acceptMessageSchema>;

function UserDashboard() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isFetchingSettings, setIsFetchingSettings] = useState(false);
  const [isTogglePending, setIsTogglePending] = useState(false);
  const [profileUrl, setProfileUrl] = useState('');
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const { data: session, status: sessionStatus } = useSession();

  const handleDeleteMessage = (messageId: string) => {
    setMessages((prev) =>
      prev.filter((message) => String(message._id) !== messageId)
    );
  };

  const { control, setValue } = useForm<AcceptMessageFormData>({
    resolver: zodResolver(acceptMessageSchema),
    defaultValues: {
      acceptMessages: false,
    },
  });

  const acceptMessages = useWatch({
    control,
    name: 'acceptMessages',
  });

  const fetchAcceptMessages = useCallback(async () => {
    setIsFetchingSettings(true);
    try {
      const response = await axios.get<ApiResponse>('/api/accept-messages');
      setValue(
        'acceptMessages',
        typeof response.data.isAcceptingMessage === 'boolean'
          ? response.data.isAcceptingMessage
          : false
      );
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      const status = axiosError.response?.status;
      const message = axiosError.response?.data.message;

      if (status === 404 && message === 'User not found.') {
        toast.error('User not found.');
      } else {
        toast.error(message || 'Failed to fetch message settings');
      }
    } finally {
      setIsFetchingSettings(false);
    }
  }, [setValue]);

  const fetchMessages = useCallback(async (refresh: boolean = false) => {
    setIsLoading(true);
    try {
      const response = await axios.get<ApiResponse>('/api/get-messages');
      setMessages(response.data.messages || []);
      if (refresh) {
        toast.success('Showing latest messages');
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      const status = axiosError.response?.status;
      const message = axiosError.response?.data.message;

      if (status === 404 && message === 'User not found.') {
        toast.error('User not found.');
      } else {
        toast.error(message ?? 'Failed to fetch messages');
      }
    } finally {
      setIsLoading(false);
      setHasLoadedOnce(true);
    }
  }, []);

  // Fetch initial state once the session is available
  useEffect(() => {
    if (!session?.user) return;
    fetchMessages();
    fetchAcceptMessages();
  }, [session, fetchAcceptMessages, fetchMessages]);

  // Client-only: computed after mount to avoid a server/client hydration
  // mismatch (window.location doesn't exist during SSR).
  useEffect(() => {
    if (!session?.user) {
      setProfileUrl('');
      return;
    }
    const { username } = session.user as User;
    setProfileUrl(`${window.location.origin}/u/${username}`);
  }, [session]);

  const handleSwitchChange = async (checked: boolean) => {
    setIsTogglePending(true);
    try {
      const response = await axios.post<ApiResponse>('/api/accept-messages', {
        acceptMessages: checked,
      });
      toast.success(response.data.message);
    } catch (error) {
      // Revert the optimistic UI update — the server didn't accept the change.
      setValue('acceptMessages', !checked);

      const axiosError = error as AxiosError<ApiResponse>;
      const status = axiosError.response?.status;
      const message = axiosError.response?.data.message;

      if (status === 404 && message === 'User not found.') {
        toast.error('User not found.');
      } else {
        toast.error(message || 'Failed to update message settings');
      }
    } finally {
      setIsTogglePending(false);
    }
  };

  const copyToClipboard = async () => {
    if (!profileUrl) return;
    try {
      await navigator.clipboard.writeText(profileUrl);
      toast.success('Link copied to clipboard.');
    } catch {
      toast.error('Could not copy the link. Copy it manually instead.');
    }
  };

  const handleDeleteAllMessages = async () => {
    setIsDeletingAll(true);
    try {
      const response = await axios.delete<ApiResponse>('/api/delete-messages');
      setMessages([]);
      setIsDeleteDialogOpen(false);
      toast.success(response.data.message);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(
        axiosError.response?.data.message ?? 'Failed to delete messages',
      );
    } finally {
      setIsDeletingAll(false);
    }
  };

  const messageCountLabel = useMemo(
    () =>
      messages.length === 1
        ? 'Your one message'
        : `All ${messages.length} of your messages`,
    [messages.length],
  );

  const displayName = useMemo(() => {
    if (!session?.user) return '';
    return (session.user as User).username ?? '';
  }, [session]);

  // Full-page skeleton until the session resolves and the first fetch lands.
  const isInitialLoading =
    sessionStatus === 'loading' || (Boolean(session?.user) && !hasLoadedOnce);

  if (isInitialLoading) {
    return <DashboardSkeleton />;
  }

  if (!session?.user) {
    return <div></div>;
  }

  return (
    <main className="min-h-[calc(100svh-1px)] bg-washi px-4 pb-16 pt-28 sm:px-6 sm:pt-32 lg:pb-24">
      <div className="mx-auto w-full max-w-6xl">
        <div className="relative isolate overflow-hidden rounded-[2rem] bg-sumi px-5 py-8 text-washi shadow-[0_18px_40px_rgba(30,28,26,0.12)] sm:px-8 sm:py-10">
          <div className="pointer-events-none absolute inset-0 opacity-45 [background-image:radial-gradient(circle_at_8%_20%,#e95776_0,transparent_22rem),radial-gradient(circle_at_88%_85%,#7063ff_0,transparent_24rem)]" />
          <div className="relative flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0"><div className="mb-4 inline-flex items-center gap-2 rounded-full border border-washi/20 bg-washi/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-lime"><MessageCircleMore className="size-3.5" /> Your honest inbox</div><h1 className="font-display text-5xl leading-[0.85] tracking-[-0.06em] break-words sm:text-6xl">Hello{displayName ? `, ${displayName}.` : '.'}</h1><p className="mt-4 max-w-xl text-sm leading-6 text-washi/70 sm:text-base">Everything here arrived without a name attached. Read it when you are ready.</p></div>
            <div className="flex w-fit items-center gap-3 rounded-2xl border border-washi/15 bg-washi/10 px-4 py-3 backdrop-blur"><div className="grid size-10 place-items-center rounded-xl bg-lime text-sumi"><ShieldCheck className="size-5" /></div><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-lime">Inbox status</p><p className="mt-0.5 text-sm text-washi/75">{acceptMessages ? 'Open for messages' : 'Paused for now'}</p></div></div>
          </div>
        </div>

      <Card className="mt-5 overflow-hidden rounded-[1.75rem] border-sumi/10 bg-card shadow-[0_10px_30px_rgba(30,28,26,0.06)]">
        <CardContent className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="min-w-0"><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-coral"><Link2 className="size-3.5" /> Your share link</div><p className="mt-2 text-sm leading-6 text-kobicha">Share this link anywhere. People can write to you without revealing who they are.</p>
          <div className="mt-4 flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
            <div
              title={profileUrl || undefined}
              className="w-full min-w-0 flex-1 truncate rounded-xl border border-sumi/12 bg-washi px-4 py-3 text-sm text-sumi"
            >
              {profileUrl || '—'}
            </div>
            <Button
              onClick={copyToClipboard}
              variant="outline"
              disabled={!profileUrl}
              className="h-11 w-full shrink-0 gap-2 rounded-xl border-sumi/20 px-4 text-sumi transition-all hover:-translate-y-0.5 hover:bg-sumi hover:text-washi active:translate-y-0 active:scale-[0.98] sm:w-auto"
            >
              <Copy data-icon="inline-start" className="size-4" /> Copy link
            </Button>
          </div></div>
          <div className="flex min-h-28 min-w-0 items-center justify-between gap-5 rounded-2xl bg-sumi p-5 text-washi lg:min-w-80"><div className="min-w-0"><p className="text-sm font-semibold">Accepting messages</p><p className="mt-1 max-w-48 text-xs leading-5 text-washi/60">Pause new messages whenever you need.</p></div>
            <div className="flex shrink-0 items-center">
              <Controller
                name="acceptMessages"
                control={control}
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    size="lg"
                    aria-label={acceptMessages ? 'Stop accepting messages' : 'Start accepting messages'}
                    className="isolate rounded-xl border-washi/40 data-checked:!bg-lime data-unchecked:!bg-washi/25 before:pointer-events-none before:absolute before:top-1/2 before:z-0 before:-translate-y-1/2 before:text-[0.6rem] before:font-extrabold before:tracking-[0.14em] data-checked:before:left-2 data-checked:before:text-sumi data-checked:before:content-['ON'] data-unchecked:before:right-2 data-unchecked:before:text-washi/75 data-unchecked:before:content-['OFF'] [&_[data-slot=switch-thumb]]:!bg-washi"
                    onCheckedChange={(checked) => {
                      field.onChange(checked);
                      handleSwitchChange(checked);
                    }}
                    disabled={isFetchingSettings || isTogglePending}
                  />
                )}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><p className="text-xs font-bold uppercase tracking-[0.22em] text-coral">Inbox</p><h2 className="mt-1 font-display text-3xl tracking-[-0.04em] text-sumi">Messages <span className="text-kobicha">({messages.length})</span></h2></div>
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <AlertDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          >
            <AlertDialogTrigger
              render={
                <Button
                  variant="destructive"
                  disabled={messages.length === 0 || isDeletingAll}
                  className="h-11 flex-1 rounded-xl px-4 text-sm sm:flex-none"
                />
              }
            >
              {isDeletingAll ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Delete all
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogMedia>
                  <Trash2 />
                </AlertDialogMedia>
                <div className="space-y-2">
                  <AlertDialogEyebrow>Can&apos;t be undone</AlertDialogEyebrow>
                  <AlertDialogTitle>
                    Empty your inbox?
                  </AlertDialogTitle>
                </div>
                <AlertDialogDescription>
                  {messageCountLabel} will be permanently deleted. We keep no
                  copy, and senders are never told.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeletingAll}>Keep them</AlertDialogCancel>
                <AlertDialogAction
                  disabled={isDeletingAll}
                  onClick={handleDeleteAllMessages}
                  className="bg-destructive text-washi hover:bg-destructive/90"
                >
                  {isDeletingAll ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Deleting…
                    </>
                  ) : (
                    <>
                      <Trash2 className="size-4" />
                      Delete everything
                    </>
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button
            variant="outline"
            disabled={isLoading || isDeletingAll}
            className="h-11 flex-1 gap-2 rounded-xl border-sumi/20 px-4 text-sm text-sumi transition-all hover:-translate-y-0.5 hover:bg-sumi hover:text-washi active:translate-y-0 active:scale-[0.98] sm:flex-none"
            onClick={() => fetchMessages(true)}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw className="h-4 w-4" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      {isLoading && messages.length === 0 ? (
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <MessageCardSkeleton key={index} />
          ))}
        </div>
      ) : messages.length > 0 ? (
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          {messages.map((message) => (
            <MessageCard
              key={String(message._id)}
              message={message}
              onMessageDelete={handleDeleteMessage}
            />
          ))}
        </div>
      ) : (
        <div className="mt-5 flex flex-col items-center gap-3 rounded-[1.75rem] border border-dashed border-sumi/20 bg-card/60 px-6 py-16 text-center">
          <div className="grid size-14 place-items-center rounded-2xl bg-sumi text-lime"><Inbox className="size-6" /></div>
          <p className="max-w-sm text-sm leading-6 text-kobicha">
            No messages yet. Share your link above to start hearing from
            people.
          </p>
        </div>
      )}
      </div>
    </main>
  );
}

export default UserDashboard;
