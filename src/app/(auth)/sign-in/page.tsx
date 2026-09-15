'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import * as z from 'zod';
import { signIn } from 'next-auth/react';
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { signInSchema } from '@/schemas/signInSchema';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

export default function SignInForm() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);

    const form = useForm<z.infer<typeof signInSchema>>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            identifier: '',
            password: '',
        },
    });

    const onSubmit = async (data: z.infer<typeof signInSchema>) => {
        const result = await signIn('credentials', {
            redirect: false,
            identifier: data.identifier,
            password: data.password,
        });

        if (result?.error) {
            if (result.error === 'CredentialsSignin') {
                toast.error('Login Failed', {
                    description: 'Incorrect username or password',
                });
            } else {
                toast.error('Error', {
                    description: result.error,
                });
            }
        }

        if (result?.url) {
            router.replace('/dashboard');
        }
    };

    return (
        <div className="relative flex min-h-[80vh] items-center justify-center overflow-hidden bg-sumi px-4 py-16">
            <svg
                viewBox="0 0 200 200"
                fill="none"
                className="pointer-events-none absolute -right-16 -bottom-16 h-72 w-72 text-washi opacity-[0.04]"
            >
                <path
                    d="M100 20c-46 5-80 40-75 88 5 46 47 78 92 72 41-5 68-36 72-72"
                    stroke="currentColor"
                    strokeWidth="6"
                    strokeLinecap="round"
                />
            </svg>

            <div className="relative w-full max-w-md rounded-2xl border border-washi/10 bg-card p-8 shadow-xl">
                <div className="text-center">
                    <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-shu/25 bg-shu/5 px-3 py-1 text-xs text-shu">
                        本音 · honne
                    </div>
                    <h1 className="font-display text-3xl tracking-tight text-sumi sm:text-4xl">
                        Welcome back
                    </h1>
                    <p className="mt-2 text-sm text-kobicha">
                        Sign in to see what's waiting in your inbox
                    </p>
                </div>

                <form
                    id="sign-in-form"
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="mt-8"
                >
                    <FieldGroup>
                        <Controller
                            name="identifier"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="sign-in-identifier" className="text-sumi">
                                        Email or username
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        id="sign-in-identifier"
                                        aria-invalid={fieldState.invalid}
                                        autoComplete="username"
                                        className="border-sumi/15 bg-washi text-sumi focus-visible:border-aizome focus-visible:ring-aizome/30"
                                    />
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />
                        <Controller
                            name="password"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <div className="flex items-center justify-between">
                                        <FieldLabel htmlFor="sign-in-password" className="text-sumi">
                                            Password
                                        </FieldLabel>
                                    </div>
                                    <div className="relative">
                                        <Input
                                            {...field}
                                            id="sign-in-password"
                                            type={showPassword ? 'text' : 'password'}
                                            aria-invalid={fieldState.invalid}
                                            autoComplete="current-password"
                                            className="border-sumi/15 bg-washi pr-10 text-sumi focus-visible:border-aizome focus-visible:ring-aizome/30"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((visible) => !visible)}
                                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                                            aria-pressed={showPassword}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-kobicha transition-colors hover:text-sumi focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aizome focus-visible:ring-offset-2"
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />
                        <Button
                            className="w-full rounded-full bg-sumi text-washi hover:bg-sumi/85"
                            type="submit"
                            form="sign-in-form"
                        >
                            Sign in
                        </Button>
                    </FieldGroup>
                </form>

                <div className="mt-6 text-center text-sm text-kobicha">
                    Not a member yet?{' '}
                    <Link
                        href="/sign-up"
                        className="font-medium text-aizome underline-offset-4 hover:underline"
                    >
                        Sign up
                    </Link>
                </div>
            </div>
        </div>
    );
}
