'use client';

import { MessageCard } from '@/components/MessageCard';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Message } from '@/model/User';
import { ApiResponse } from '@/types/ApiResponse';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosError } from 'axios';
import { Loader2, RefreshCcw } from 'lucide-react';
import { User } from 'next-auth';
import { useSession } from 'next-auth/react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { acceptMessageSchema } from '@/schemas/acceptMessageSchema';

type AcceptMessageFormData = z.infer<typeof acceptMessageSchema>;

function UserDashboard() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState(false);
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
    setIsSwitchLoading(true);
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
      setIsSwitchLoading(false);
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

  const profileUrl = useMemo(() => {
    if (!session?.user || typeof window === 'undefined') return '';
    const { username } = session.user as User;
    return `${window.location.origin}/u/${username}`;
  }, [session]);

  const handleSwitchChange = async (checked: boolean) => {
    try {
      const response = await axios.post<ApiResponse>('/api/accept-messages', {
        acceptMessages: checked,
      });
      setValue('acceptMessages', checked);
      toast.success(response.data.message);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      const status = axiosError.response?.status;
      const message = axiosError.response?.data.message;

      if (status === 404 && message === 'User not found.') {
        toast.error('User not found.');
      } else {
        toast.error(message || 'Failed to update message settings');
      }
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl);
    toast.success('Profile URL has been copied to clipboard.');
  };

  if (!session?.user) {
    return <div></div>;
  }

  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
      <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>

      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Copy Your Unique Link</h2>
        <div className="flex items-center">
          <input
            type="text"
            value={profileUrl}
            disabled
            className="input input-bordered w-full p-2 mr-2"
          />
          <Button onClick={copyToClipboard}>Copy</Button>
        </div>
      </div>

      <div className="mb-4 flex items-center">
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
              disabled={isSwitchLoading}
            />
          )}
        />
        <span className="ml-2">
          Accept Messages: {acceptMessages ? 'On' : 'Off'}
        </span>
      </div>
      <Separator />

      <Button
        className="mt-4"
        variant="outline"
        onClick={(e) => {
          e.preventDefault();
          fetchMessages(true);
        }}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCcw className="h-4 w-4" />
        )}
      </Button>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {messages.length > 0 ? (
          messages.map((message) => (
            <MessageCard
              key={String(message._id)}
              message={message}
              onMessageDelete={handleDeleteMessage}
            />
          ))
        ) : (
          <p>No messages to display.</p>
        )}
      </div>
    </div>
  );
}

export default UserDashboard;