"use client";

import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CalendarDays } from "lucide-react";
import Image from "next/image";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case "OAuthCreateAccount":
        return "Unable to create account. Please try again.";
      case "OAuthSignin":
        return "Error during sign in. Please try again.";
      case "OAuthCallback":
        return "Error during authentication. Please try again.";
      case "OAuthAccountNotLinked":
        return "Email already in use with different provider.";
      default:
        return "An error occurred during authentication.";
    }
  };

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.svg"
              alt="Gravitas"
              width={32}
              height={32}
              className="h-8 w-auto"
            />
            <span className="text-xl font-bold">Gravitas</span>
          </div>
          <CardTitle className="text-center text-2xl">Authentication Error</CardTitle>
          <CardDescription className="text-center">
            {getErrorMessage(error)}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button asChild>
            <Link href="/auth/signin">Try Again</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 