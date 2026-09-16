'use client';

import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowRight, Eye, EyeOff, LockKeyhole, MessageCircleMore, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { signInSchema } from '@/schemas/signInSchema';

export default function SignInForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: { identifier: '', password: '' },
  });
  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    const result = await signIn('credentials', { redirect: false, identifier: data.identifier, password: data.password });

    if (result?.error) {
      toast.error(result.error === 'CredentialsSignin' ? 'Login failed' : 'Error', {
        description: result.error === 'CredentialsSignin' ? 'Incorrect username or password.' : result.error,
      });
      return;
    }

    if (result?.url) router.replace('/dashboard');
  };

  return (
    <main className="relative isolate flex min-h-[calc(100svh-1px)] flex-col justify-center overflow-hidden bg-sumi px-3 py-24 text-washi sm:px-6 sm:py-32 lg:grid lg:grid-cols-2 lg:items-stretch lg:px-8 lg:py-0">
      <div className="pointer-events-none absolute inset-0 opacity-50 [background-image:radial-gradient(circle_at_8%_22%,#e95776_0,transparent_24rem),radial-gradient(circle_at_85%_80%,#7063ff_0,transparent_28rem)]" />
      <div className="pointer-events-none absolute -left-28 top-32 size-72 rounded-full border border-washi/15" />
      <div className="pointer-events-none absolute right-[9%] top-28 size-16 rotate-12 rounded-[1.5rem] bg-coral/90" />

      <section className="relative hidden max-w-xl flex-col justify-center py-32 lg:flex lg:pl-[max(0px,calc((100vw-80rem)/2))] lg:pr-16">
        <div className="mb-8 inline-flex w-fit items-center gap-2 rounded-full border border-washi/20 bg-washi/10 px-3 py-1.5 text-xs font-medium tracking-wide backdrop-blur"><Sparkles className="size-3.5 text-lime" />Your words have a place to land</div>
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-lime">Not Gonna Lie</p>
        <h1 className="mt-4 font-display text-7xl leading-[0.82] tracking-[-0.07em] text-washi xl:text-8xl">Back to the<br /><span className="text-coral">honest stuff.</span></h1>
        <p className="mt-8 max-w-md text-lg leading-8 text-washi/70">Your inbox is ready when you are. Sign in to read what people wanted to say.</p>
        <div className="mt-12 flex items-center gap-4 text-sm text-washi/60"><div className="grid size-11 place-items-center rounded-full border border-washi/15 bg-washi/10 text-lime"><MessageCircleMore className="size-5" /></div><p>Private inbox. Verified account.<br />Anonymous messages.</p></div>
      </section>

      <section className="relative flex items-center justify-center lg:py-28 lg:pl-12 lg:pr-[max(0px,calc((100vw-80rem)/2))]">
        <div className="w-full max-w-md rounded-[1.75rem] border border-washi/15 bg-washi p-4 text-sumi shadow-[0_28px_80px_rgba(0,0,0,0.32)] min-[380px]:p-5 sm:rounded-[2rem] sm:p-8">
          <div className="flex items-start justify-between gap-3 sm:gap-4"><div className="min-w-0"><div className="mb-4 inline-flex items-center gap-2 rounded-full bg-sumi px-3 py-1.5 text-xs font-semibold tracking-wide text-lime sm:mb-5"><LockKeyhole className="size-3.5" />Secure sign in</div><h2 className="font-display text-[2.15rem] leading-none tracking-[-0.055em] sm:text-5xl">Welcome back.</h2><p className="mt-3 max-w-sm text-sm leading-6 text-kobicha">Sign in to see what is waiting in your anonymous inbox.</p></div><div className="hidden size-11 shrink-0 place-items-center rounded-2xl bg-coral text-washi min-[380px]:grid"><MessageCircleMore className="size-5" /></div></div>

          <form id="sign-in-form" onSubmit={form.handleSubmit(onSubmit)} className="mt-7 sm:mt-8" noValidate>
            <FieldGroup className="gap-5">
              <Controller name="identifier" control={form.control} render={({ field, fieldState }) => <Field data-invalid={fieldState.invalid} className="gap-2"><FieldLabel htmlFor="sign-in-identifier" className="text-sm font-semibold text-sumi">Email or username</FieldLabel><Input {...field} id="sign-in-identifier" aria-invalid={fieldState.invalid} autoComplete="username" placeholder="you@example.com" className="h-13 rounded-xl border-sumi/15 bg-white px-4 text-base text-sumi shadow-none placeholder:text-kobicha/55 focus-visible:border-aizome focus-visible:ring-aizome/25" />{fieldState.invalid && <FieldError errors={[fieldState.error]} />}</Field>} />
              <Controller name="password" control={form.control} render={({ field, fieldState }) => <Field data-invalid={fieldState.invalid} className="gap-2"><FieldLabel htmlFor="sign-in-password" className="text-sm font-semibold text-sumi">Password</FieldLabel><div className="relative"><Input {...field} id="sign-in-password" type={showPassword ? 'text' : 'password'} aria-invalid={fieldState.invalid} autoComplete="current-password" placeholder="Enter your password" className="h-13 rounded-xl border-sumi/15 bg-white px-4 pr-12 text-base text-sumi shadow-none placeholder:text-kobicha/55 focus-visible:border-aizome focus-visible:ring-aizome/25" /><button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} className="absolute right-2 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-lg text-kobicha transition-colors hover:bg-sumi/5 hover:text-sumi focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aizome/50">{showPassword ? <EyeOff className="size-[1.1rem]" /> : <Eye className="size-[1.1rem]" />}</button></div>{fieldState.invalid && <FieldError errors={[fieldState.error]} />}</Field>} />
              <Button type="submit" form="sign-in-form" disabled={isSubmitting} className="group mt-2 h-13 w-full gap-2.5 rounded-full bg-sumi px-5 text-[0.95rem] text-washi shadow-[0_10px_24px_rgba(30,28,26,0.2)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-sumi/90 hover:shadow-[0_14px_30px_rgba(30,28,26,0.28)] active:translate-y-0 active:scale-[0.98] disabled:translate-y-0 min-[380px]:px-6 sm:text-base">{isSubmitting ? 'Signing in…' : 'Sign in to your inbox'}{!isSubmitting && <ArrowRight data-icon="inline-end" className="size-[1.1rem] transition-transform duration-200 group-hover:translate-x-1" />}</Button>
            </FieldGroup>
          </form>
          <p className="mt-7 text-center text-sm text-kobicha">New here? <Link href="/sign-up" className="font-semibold text-aizome underline decoration-aizome/35 underline-offset-4 transition-colors hover:text-sumi hover:decoration-sumi">Create your inbox</Link></p>
        </div>
      </section>
    </main>
  );
}
