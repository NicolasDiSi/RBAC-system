'use client'

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-destructive">
            500 - Something Went Wrong
          </CardTitle>
          <CardDescription>
            An unexpected error occurred on our end.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <p>We have been notified and are working to fix the issue. Please try again in a few moments.</p>
            {process.env.NODE_ENV !== 'production' && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                    <p className="font-bold">Development Error Details:</p>
                    <pre className="mt-1 text-xs whitespace-pre-wrap font-mono">
                        {error.message}
                    </pre>
                </div>
            )}
        </CardContent>
        <CardFooter>
          <Button onClick={() => reset()} className="w-full">
            Try Again
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}