'use client';

import { MessageCard } from '@/components/MessageCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Message } from '@/model/User';
import { ApiResponse } from '@/types/ApiResponse';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosError } from 'axios';
import { Copy, Inbox, Loader2, RefreshCcw, Trash2 } from 'lucide-react';
import { User } from 'next-auth';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { acceptMessageSchema } from '@/schemas/acceptMessageSchema';

type AcceptMessageFormData = z.infer<typeof acceptMessageSchema>;

function UserDashboard() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isFetchingSettings, setIsFetchingSettings] = useState(false);
  const [isTogglePending, setIsTogglePending] = useState(false);
  const [profileUrl, setProfileUrl] = useState('');
  const { data: session } = useSession();

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

  const displayName = useMemo(() => {
    if (!session?.user) return '';
    return (session.user as User).username ?? '';
  }, [session]);

  if (!session?.user) {
    return <div></div>;
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:py-14">
      <div className="mb-8">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-shu/25 bg-shu/5 px-3 py-1 text-xs text-shu">
          本音 · honne
        </div>
        <h1 className="font-display text-3xl text-sumi sm:text-4xl">
          Your inbox
        </h1>
        <p className="mt-1 text-sm text-kobicha">
          {displayName ? `@${displayName} — ` : ''}Everything here arrived
          without a name attached.
        </p>
      </div>

      <Card className="border-sumi/10 bg-card shadow-none">
        <CardContent className="p-5 sm:p-6">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-kobicha">
            Your link
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex-1 truncate rounded-lg border border-sumi/15 bg-washi px-3 py-2 text-sm text-sumi">
              {profileUrl || '—'}
            </div>
            <Button
              onClick={copyToClipboard}
              variant="outline"
              disabled={!profileUrl}
              className="border-sumi/20 text-sumi hover:bg-sumi hover:text-washi sm:w-auto"
            >
              <Copy data-icon="inline-start" className="h-4 w-4" />
              Copy
            </Button>
          </div>

          <Separator className="my-5 bg-sumi/10" />

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-sumi">
                Accepting messages
              </p>
              <p className="text-xs text-kobicha">
                Turn this off any time to pause new messages
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Controller
                name="acceptMessages"
                control={control}
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      field.onChange(checked);
                      handleSwitchChange(checked);
                    }}
                    disabled={isFetchingSettings || isTogglePending}
                  />
                )}
              />
              <span className="text-sm text-kobicha">
                {acceptMessages ? 'On' : 'Off'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-10 flex items-center justify-between">
        <h2 className="font-display text-xl text-sumi">Messages</h2>
        <div className="flex items-center gap-2">
          <AlertDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          >
            <AlertDialogTrigger
              render={
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={messages.length === 0 || isDeletingAll}
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
                <AlertDialogTitle>Delete all messages?</AlertDialogTitle>
                <AlertDialogDescription>
                  This permanently removes every message from your inbox. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeletingAll}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  disabled={isDeletingAll}
                  onClick={handleDeleteAllMessages}
                >
                  Delete all messages
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button
            variant="outline"
            size="sm"
            disabled={isLoading || isDeletingAll}
            className="border-sumi/20 text-sumi hover:bg-sumi hover:text-washi"
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

      {messages.length > 0 ? (
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          {messages.map((message) => (
            <MessageCard
              key={String(message._id)}
              message={message}
              onMessageDelete={handleDeleteMessage}
            />
          ))}
        </div>
      ) : (
        <div className="mt-4 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-sumi/15 bg-card/50 px-6 py-16 text-center">
          <Inbox className="h-8 w-8 text-kobicha" />
          <p className="text-sm text-kobicha">
            No messages yet. Share your link above to start hearing from
            people.
          </p>
        </div>
      )}
    </div>
  );
}

export default UserDashboard;
