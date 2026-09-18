'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios, { AxiosError } from 'axios';
import { OTPField } from '@base-ui/react/otp-field';
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  MailCheck,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  forgotPasswordSchema,
  newPasswordSchema,
  resetCodeSchema,
} from '@/schemas/forgotPasswordSchema';
import { ApiResponse } from '@/types/ApiResponse';

const CODE_LENGTH = 6;

type Step = 'email' | 'code' | 'password';

const slotClassName =
  'h-13 w-full min-w-0 rounded-xl border border-sumi/15 bg-white text-center font-display text-xl text-sumi shadow-none outline-none transition-all duration-150 data-filled:border-sumi/35 data-filled:bg-washi focus:border-aizome focus:ring-3 focus:ring-aizome/25 data-invalid:border-destructive data-invalid:ring-destructive/15 disabled:opacity-50 sm:h-14 sm:text-2xl';

const inputClassName =
  'h-13 rounded-xl border-sumi/15 bg-white px-4 text-base text-sumi shadow-none placeholder:text-kobicha/55 focus-visible:border-aizome focus-visible:ring-aizome/25';

const submitClassName =
  'group mt-1 h-13 w-full gap-2.5 rounded-full bg-sumi px-5 text-[0.95rem] text-washi shadow-[0_10px_24px_rgba(30,28,26,0.2)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-sumi/90 hover:shadow-[0_14px_30px_rgba(30,28,26,0.28)] active:translate-y-0 active:scale-[0.98] disabled:translate-y-0 min-[380px]:px-6 sm:text-base';

const STEP_COPY: Record<Step, { badge: string; title: string; blurb: string }> = {
  email: {
    badge: 'Reset your password',
    title: 'Forgot it?',
    blurb: 'Tell us the email on your account and we will send a 6-digit code.',
  },
  code: {
    badge: 'Check your inbox',
    title: 'Enter the code.',
    blurb: 'We sent a 6-digit code. It expires in 15 minutes.',
  },
  password: {
    badge: 'Almost there',
    title: 'Pick a new one.',
    blurb: 'Choose a password you have not used here before.',
  },
};

function errorMessage(error: unknown, fallback: string) {
  const axiosError = error as AxiosError<ApiResponse>;
  return axiosError.response?.data.message || axiosError.message || fallback;
}

export default function ForgotPassword() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const emailForm = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const codeForm = useForm<z.infer<typeof resetCodeSchema>>({
    resolver: zodResolver(resetCodeSchema),
    defaultValues: { code: '' },
  });

  const passwordForm = useForm<z.infer<typeof newPasswordSchema>>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onRequestCode = async (data: z.infer<typeof forgotPasswordSchema>) => {
    try {
      await axios.post<ApiResponse>('/api/forgot-password', { email: data.email });
      setEmail(data.email);
      setStep('code');
      // The API answers the same way for unknown addresses, so this wording
      // never confirms whether an account exists.
      toast.success('Code sent', {
        description: 'If that email has an account, the code is on its way.',
      });
    } catch (error) {
      toast.error('Could not send the code', {
        description: errorMessage(error, 'Please try again.'),
      });
    }
  };

  const onCheckCode = async (data: z.infer<typeof resetCodeSchema>) => {
    try {
      await axios.post<ApiResponse>('/api/forgot-password/verify', {
        email,
        code: data.code,
      });
      setCode(data.code);
      setStep('password');
    } catch (error) {
      toast.error('That did not work', {
        description: errorMessage(error, 'Check the code and try again.'),
      });
      codeForm.setValue('code', '');
    }
  };

  const onSetPassword = async (data: z.infer<typeof newPasswordSchema>) => {
    try {
      const response = await axios.post<ApiResponse>('/api/reset-password', {
        email,
        code,
        password: data.password,
      });
      toast.success('Password updated', { description: response.data.message });
      router.replace('/sign-in');
    } catch (error) {
      toast.error('Could not reset your password', {
        description: errorMessage(error, 'Please try again.'),
      });
    }
  };

  const restart = () => {
    setStep('email');
    setCode('');
    codeForm.reset({ code: '' });
    passwordForm.reset({ password: '', confirmPassword: '' });
  };

  const copy = STEP_COPY[step];
  const stepIndex = step === 'email' ? 0 : step === 'code' ? 1 : 2;

  return (
    <main className="relative isolate flex min-h-[calc(100svh-1px)] flex-col justify-center overflow-hidden bg-sumi px-3 py-24 text-washi sm:px-6 sm:py-32 lg:grid lg:grid-cols-2 lg:items-stretch lg:px-8 lg:py-0">
      <div className="pointer-events-none absolute inset-0 opacity-50 [background-image:radial-gradient(circle_at_8%_22%,#e95776_0,transparent_24rem),radial-gradient(circle_at_85%_80%,#7063ff_0,transparent_28rem)]" />
      <div className="pointer-events-none absolute -left-28 top-32 size-72 rounded-full border border-washi/15" />
      <div className="pointer-events-none absolute right-[9%] top-28 size-16 rotate-12 rounded-[1.5rem] bg-coral/90" />

      <section className="relative hidden max-w-xl flex-col justify-center py-32 lg:flex lg:pl-[max(0px,calc((100vw-80rem)/2))] lg:pr-16">
        <div className="mb-8 inline-flex w-fit items-center gap-2 rounded-full border border-washi/20 bg-washi/10 px-3 py-1.5 text-xs font-medium tracking-wide backdrop-blur">
          <KeyRound className="size-3.5 text-lime" />
          Happens to everyone
        </div>
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-lime">Not Gonna Lie</p>
        <h1 className="mt-4 font-display text-7xl leading-[0.82] tracking-[-0.07em] text-washi xl:text-8xl">
          Locked out?<br />
          <span className="text-coral">Not for long.</span>
        </h1>
        <p className="mt-8 max-w-md text-lg leading-8 text-washi/70">
          Three steps: your email, the code we send, then a fresh password.
        </p>
        <div className="mt-12 flex items-center gap-4 text-sm text-washi/60">
          <div className="grid size-11 shrink-0 place-items-center rounded-full border border-washi/15 bg-washi/10 text-lime">
            <ShieldCheck className="size-5" />
          </div>
          <p>
            Your messages stay where they are.<br />
            Only the password changes.
          </p>
        </div>
      </section>

      <section className="relative flex items-center justify-center lg:py-28 lg:pl-12 lg:pr-[max(0px,calc((100vw-80rem)/2))]">
        <div className="w-full max-w-md rounded-[1.75rem] border border-washi/15 bg-washi p-4 text-sumi shadow-[0_28px_80px_rgba(0,0,0,0.32)] min-[380px]:p-5 sm:rounded-[2rem] sm:p-8">
          <div className="flex items-start justify-between gap-3 sm:gap-4">
            <div className="min-w-0">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-sumi px-3 py-1.5 text-xs font-semibold tracking-wide text-lime sm:mb-5">
                {step === 'code' ? <MailCheck className="size-3.5" /> : <KeyRound className="size-3.5" />}
                {copy.badge}
              </div>
              <h2 className="font-display text-[2.15rem] leading-none tracking-[-0.055em] sm:text-5xl">
                {copy.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-kobicha">
                {copy.blurb}
                {step !== 'email' && email ? (
                  <>
                    {' '}
                    <span className="font-semibold break-all text-sumi">{email}</span>
                  </>
                ) : null}
              </p>
            </div>
            <div className="hidden size-11 shrink-0 place-items-center rounded-2xl bg-coral text-washi min-[380px]:grid">
              <KeyRound className="size-5" />
            </div>
          </div>

          {/* Step rail */}
          <div className="mt-6 flex items-center gap-1.5" aria-hidden="true">
            {[0, 1, 2].map((index) => (
              <span
                key={index}
                className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                  index <= stepIndex ? 'bg-sumi' : 'bg-sumi/15'
                }`}
              />
            ))}
          </div>
          <p className="sr-only" role="status">
            Step {stepIndex + 1} of 3
          </p>

          {step === 'email' && (
            <form
              id="forgot-email-form"
              onSubmit={emailForm.handleSubmit(onRequestCode)}
              className="mt-6"
              noValidate
            >
              <FieldGroup className="gap-5">
                <Controller
                  name="email"
                  control={emailForm.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="gap-2">
                      <FieldLabel htmlFor="forgot-email" className="text-sm font-semibold text-sumi">
                        Email address
                      </FieldLabel>
                      <Input
                        {...field}
                        id="forgot-email"
                        type="email"
                        aria-invalid={fieldState.invalid}
                        autoComplete="email"
                        placeholder="you@example.com"
                        className={inputClassName}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
                <Button
                  type="submit"
                  form="forgot-email-form"
                  disabled={emailForm.formState.isSubmitting}
                  className={submitClassName}
                >
                  {emailForm.formState.isSubmitting ? (
                    <>
                      <Loader2 className="size-[1.1rem] animate-spin" />
                      Sending&hellip;
                    </>
                  ) : (
                    <>
                      Send reset code
                      <ArrowRight
                        data-icon="inline-end"
                        className="size-[1.1rem] transition-transform duration-200 group-hover:translate-x-1"
                      />
                    </>
                  )}
                </Button>
              </FieldGroup>
            </form>
          )}

          {step === 'code' && (
            <form
              id="forgot-code-form"
              onSubmit={codeForm.handleSubmit(onCheckCode)}
              className="mt-6"
              noValidate
            >
              <FieldGroup className="gap-5">
                <Controller
                  name="code"
                  control={codeForm.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="gap-2.5">
                      <FieldLabel htmlFor="reset-code" className="text-sm font-semibold text-sumi">
                        Reset code
                      </FieldLabel>
                      <OTPField.Root
                        id="reset-code"
                        length={CODE_LENGTH}
                        value={field.value}
                        onValueChange={(value) => field.onChange(value)}
                        onValueComplete={(value) => {
                          if (codeForm.formState.isSubmitting) return;
                          codeForm.setValue('code', value, { shouldValidate: true });
                          void codeForm.handleSubmit(onCheckCode)();
                        }}
                        disabled={codeForm.formState.isSubmitting}
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
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
                <Button
                  type="submit"
                  form="forgot-code-form"
                  disabled={codeForm.formState.isSubmitting}
                  className={submitClassName}
                >
                  {codeForm.formState.isSubmitting ? (
                    <>
                      <Loader2 className="size-[1.1rem] animate-spin" />
                      Checking&hellip;
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight
                        data-icon="inline-end"
                        className="size-[1.1rem] transition-transform duration-200 group-hover:translate-x-1"
                      />
                    </>
                  )}
                </Button>
              </FieldGroup>
            </form>
          )}

          {step === 'password' && (
            <form
              id="forgot-password-form"
              onSubmit={passwordForm.handleSubmit(onSetPassword)}
              className="mt-6"
              noValidate
            >
              <FieldGroup className="gap-5">
                <Controller
                  name="password"
                  control={passwordForm.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="gap-2">
                      <FieldLabel htmlFor="new-password" className="text-sm font-semibold text-sumi">
                        New password
                      </FieldLabel>
                      <div className="relative">
                        <Input
                          {...field}
                          id="new-password"
                          type={showPassword ? 'text' : 'password'}
                          aria-invalid={fieldState.invalid}
                          autoComplete="new-password"
                          placeholder="Create a new password"
                          className={`${inputClassName} pr-12`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((visible) => !visible)}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          aria-pressed={showPassword}
                          className="absolute right-2 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-lg text-kobicha transition-colors hover:bg-sumi/5 hover:text-sumi focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aizome/50"
                        >
                          {showPassword ? <EyeOff className="size-[1.1rem]" /> : <Eye className="size-[1.1rem]" />}
                        </button>
                      </div>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
                <Controller
                  name="confirmPassword"
                  control={passwordForm.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="gap-2">
                      <FieldLabel
                        htmlFor="confirm-password"
                        className="text-sm font-semibold text-sumi"
                      >
                        Confirm new password
                      </FieldLabel>
                      <Input
                        {...field}
                        id="confirm-password"
                        type={showPassword ? 'text' : 'password'}
                        aria-invalid={fieldState.invalid}
                        autoComplete="new-password"
                        placeholder="Type it again"
                        className={inputClassName}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
                <Button
                  type="submit"
                  form="forgot-password-form"
                  disabled={passwordForm.formState.isSubmitting}
                  className={submitClassName}
                >
                  {passwordForm.formState.isSubmitting ? (
                    <>
                      <Loader2 className="size-[1.1rem] animate-spin" />
                      Saving&hellip;
                    </>
                  ) : (
                    <>
                      Save new password
                      <ArrowRight
                        data-icon="inline-end"
                        className="size-[1.1rem] transition-transform duration-200 group-hover:translate-x-1"
                      />
                    </>
                  )}
                </Button>
              </FieldGroup>
            </form>
          )}

          <div className="mt-7 text-center text-sm text-kobicha">
            {step === 'email' ? (
              <Link
                href="/sign-in"
                className="inline-flex items-center gap-1.5 font-semibold text-aizome underline decoration-aizome/35 underline-offset-4 transition-colors hover:text-sumi hover:decoration-sumi"
              >
                <ArrowLeft className="size-3.5" />
                Back to sign in
              </Link>
            ) : (
              <button
                type="button"
                onClick={restart}
                className="inline-flex items-center gap-1.5 font-semibold text-aizome underline decoration-aizome/35 underline-offset-4 transition-colors hover:text-sumi hover:decoration-sumi"
              >
                <ArrowLeft className="size-3.5" />
                Use a different email
              </button>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
