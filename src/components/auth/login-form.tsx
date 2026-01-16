'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUserStore } from '@/stores/user-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

function LoginFormContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');

  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser, setLoading } = useUserStore();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setGeneralError('');
    setIsLoading(true);
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Set user in store
        setUser(result.data.user);

        // Handle role-based redirects
        const redirectTo = searchParams.get('redirect');
        const user = result.data.user;

        if (user.role === 'ADMIN') {
          // Admin users go to admin dashboard
          router.push(redirectTo || '/admin');
        } else {
          // Regular users go to homepage or specified redirect
          router.push(redirectTo || '/');
        }
      } else {
        setGeneralError(result.error || 'Login failed');
      }
    } catch (error) {
      setGeneralError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold">Sign In</h2>
        <p className="mt-2 text-sm text-gray-600">
          Welcome back! Please sign in to your account.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {generalError && (
            <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              {generalError}
            </div>
          )}

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-orange-600 text-white hover:bg-orange-700"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => router.push('/auth/register')}
                className="font-medium text-orange-600 hover:text-orange-700"
              >
                Sign up here
              </button>
            </p>
          </div>
        </form>
      </Form>

      {/* Demo credentials info */}
      <div className="mt-8 rounded-lg bg-gray-50 p-4 text-center text-sm text-gray-600">
        <p className="mb-2 font-medium">Demo Credentials:</p>
        <div className="space-y-1">
          <p>
            <strong>Customer:</strong> customer@minakitchen.ca / customer123
          </p>
          <p>
            <strong>Admin:</strong> admin@minakitchen.ca / admin123
          </p>
        </div>
      </div>
    </div>
  );
}

export function LoginForm() {
  return (
    <Suspense fallback={<div className="text-center">Loading...</div>}>
      <LoginFormContent />
    </Suspense>
  );
}
