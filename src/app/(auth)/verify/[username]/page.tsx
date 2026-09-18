'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios, { AxiosError } from 'axios';
import { OTPField } from '@base-ui/react/otp-field';
import { ArrowRight, Loader2, MailCheck, MessageCircleMore, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { verifySchema } from '@/schemas/verifySchema';
import { ApiResponse } from '@/types/ApiResponse';

const CODE_LENGTH = 6;

// Echoes the spaced-out code block in the verification email.
const slotClassName =
  'h-13 w-full min-w-0 rounded-xl border border-sumi/15 bg-white text-center font-display text-xl text-sumi shadow-none outline-none transition-all duration-150 data-filled:border-sumi/35 data-filled:bg-washi focus:border-aizome focus:ring-3 focus:ring-aizome/25 data-invalid:border-destructive data-invalid:ring-destructive/15 disabled:opacity-50 sm:h-14 sm:text-2xl';

export default function VerifyAccount() {
  const router = useRouter();
  const params = useParams<{ username: string }>();
  const username = params?.username ? decodeURIComponent(params.username) : '';

  const form = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema),
    defaultValues: { code: '' },
  });
  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = async (data: z.infer<typeof verifySchema>) => {
    try {
      const response = await axios.post<ApiResponse>('/api/verify-code', {
        username,
        code: data.code,
      });
      toast.success('Verified', { description: response.data.message });
      router.replace('/sign-in');
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error('Verification failed', {
        description: axiosError.response?.data.message || axiosError.message,
      });
      // Clear the slots so the next attempt starts from an empty field.
      form.setValue('code', '');
    }
  };

  // Submit as soon as the last digit lands. The completed value is written to
  // the form first, so we never submit a half-applied field state.
  const handleComplete = (value: string) => {
    if (form.formState.isSubmitting) return;
    form.setValue('code', value, { shouldValidate: true });
    void form.handleSubmit(onSubmit)();
  };

  return (
    <main className="relative isolate flex min-h-[calc(100svh-1px)] flex-col justify-center overflow-hidden bg-sumi px-3 py-24 text-washi sm:px-6 sm:py-32 lg:grid lg:grid-cols-2 lg:items-stretch lg:px-8 lg:py-0">
      <div className="pointer-events-none absolute inset-0 opacity-50 [background-image:radial-gradient(circle_at_8%_22%,#e95776_0,transparent_24rem),radial-gradient(circle_at_85%_80%,#7063ff_0,transparent_28rem)]" />
      <div className="pointer-events-none absolute -left-28 top-32 size-72 rounded-full border border-washi/15" />
      <div className="pointer-events-none absolute right-[9%] top-28 size-16 rotate-12 rounded-[1.5rem] bg-lime/90" />

      <section className="relative hidden max-w-xl flex-col justify-center py-32 lg:flex lg:pl-[max(0px,calc((100vw-80rem)/2))] lg:pr-16">
        <div className="mb-8 inline-flex w-fit items-center gap-2 rounded-full border border-washi/20 bg-washi/10 px-3 py-1.5 text-xs font-medium tracking-wide backdrop-blur">
          <MailCheck className="size-3.5 text-lime" />
          Check your inbox
        </div>
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-lime">Not Gonna Lie</p>
        <h1 className="mt-4 font-display text-7xl leading-[0.82] tracking-[-0.07em] text-washi xl:text-8xl">
          Six digits<br />
          <span className="text-coral">from done.</span>
        </h1>
        <p className="mt-8 max-w-md text-lg leading-8 text-washi/70">
          We emailed you a code. Enter it here and your anonymous inbox goes live.
        </p>
        <div className="mt-12 flex items-center gap-4 text-sm text-washi/60">
          <div className="grid size-11 shrink-0 place-items-center rounded-full border border-washi/15 bg-washi/10 text-lime">
            <ShieldCheck className="size-5" />
          </div>
          <p>
            Verifying keeps the inbox yours.<br />
            Nobody else can claim the name.
          </p>
        </div>
      </section>

      <section className="relative flex items-center justify-center lg:py-28 lg:pl-12 lg:pr-[max(0px,calc((100vw-80rem)/2))]">
        <div className="w-full max-w-md rounded-[1.75rem] border border-washi/15 bg-washi p-4 text-sumi shadow-[0_28px_80px_rgba(0,0,0,0.32)] min-[380px]:p-5 sm:rounded-[2rem] sm:p-8">
          <div className="flex items-start justify-between gap-3 sm:gap-4">
            <div className="min-w-0">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-sumi px-3 py-1.5 text-xs font-semibold tracking-wide text-lime sm:mb-5">
                <MailCheck className="size-3.5" />
                Verify your email
              </div>
              <h2 className="font-display text-[2.15rem] leading-none tracking-[-0.055em] sm:text-5xl">
                One code away.
              </h2>
              <p className="mt-3 text-sm leading-6 text-kobicha">
                {username ? (
                  <>
                    Enter the {CODE_LENGTH}-digit code we sent for{' '}
                    <span className="font-semibold break-all text-sumi">@{username}</span>.
                  </>
                ) : (
                  <>Enter the {CODE_LENGTH}-digit code we emailed you.</>
                )}
              </p>
            </div>
            <div className="hidden size-11 shrink-0 place-items-center rounded-2xl bg-coral text-washi min-[380px]:grid">
              <MessageCircleMore className="size-5" />
            </div>
          </div>

          <form
            id="verify-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-7 sm:mt-8"
            noValidate
          >
            <FieldGroup className="gap-5">
              <Controller
                name="code"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-2.5">
                    <FieldLabel
                      htmlFor="verification-code"
                      className="text-sm font-semibold text-sumi"
                    >
                      Verification code
                    </FieldLabel>
                    <OTPField.Root
                      id="verification-code"
                      length={CODE_LENGTH}
                      value={field.value}
                      onValueChange={(value) => field.onChange(value)}
                      onValueComplete={handleComplete}
                      disabled={isSubmitting}
                      aria-describedby="verification-code-hint"
                      className="grid grid-cols-6 gap-1.5 min-[380px]:gap-2 sm:gap-2.5"
                    >
                      {Array.from({ length: CODE_LENGTH }, (_, index) => (
                        <OTPField.Input
                          key={index}
                          className={slotClassName}
                          aria-label={`Digit ${index + 1} of ${CODE_LENGTH}`}
                        />
                      ))}
                    </OTPField.Root>
                    <p id="verification-code-hint" className="text-xs leading-5 text-kobicha">
                      The code expires 60 minutes after it was sent.
                    </p>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Button
                type="submit"
                form="verify-form"
                disabled={isSubmitting}
                className="group mt-1 h-13 w-full gap-2.5 rounded-full bg-sumi px-5 text-[0.95rem] text-washi shadow-[0_10px_24px_rgba(30,28,26,0.2)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-sumi/90 hover:shadow-[0_14px_30px_rgba(30,28,26,0.28)] active:translate-y-0 active:scale-[0.98] disabled:translate-y-0 min-[380px]:px-6 sm:text-base"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-[1.1rem] animate-spin" />
                    Verifying&hellip;
                  </>
                ) : (
                  <>
                    Verify and continue
                    <ArrowRight
                      data-icon="inline-end"
                      className="size-[1.1rem] transition-transform duration-200 group-hover:translate-x-1"
                    />
                  </>
                )}
              </Button>
            </FieldGroup>
          </form>

          <p className="mt-7 text-center text-sm text-kobicha">
            Didn&rsquo;t get it? Check your spam folder, or{' '}
            <Link
              href="/sign-up"
              className="font-semibold text-aizome underline decoration-aizome/35 underline-offset-4 transition-colors hover:text-sumi hover:decoration-sumi"
            >
              sign up again
            </Link>
            .
          </p>
        </div>
      </section>
    </main>
  );
}
