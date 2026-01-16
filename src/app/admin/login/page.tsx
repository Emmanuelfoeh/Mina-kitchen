'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ChefHat, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminLoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to regular login after a short delay to show the message
    const timer = setTimeout(() => {
      router.push('/auth/login?redirect=/admin');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  const handleRedirectNow = () => {
    router.push('/auth/login?redirect=/admin');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500">
            <ChefHat className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">Admin Access</CardTitle>
          <CardDescription>
            Admin users now use the unified login system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-700">
            <p className="mb-2 font-medium">Authentication System Updated</p>
            <p>
              Admin users now log in through the regular login page. You'll be
              automatically redirected to the admin dashboard after signing in.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Redirecting to login page in 3 seconds...
            </p>
            <Button
              onClick={handleRedirectNow}
              className="w-full bg-orange-500 hover:bg-orange-600"
            >
              Go to Login Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="mt-6 border-t pt-4 text-center text-sm text-gray-500">
            <p className="font-medium">Demo Admin Credentials:</p>
            <p className="mt-1 font-mono text-xs">
              admin@minakitchen.ca / admin123
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
