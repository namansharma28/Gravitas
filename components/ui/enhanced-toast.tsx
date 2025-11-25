"use client";

import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, XCircle, AlertCircle, Info, Loader2 } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info" | "loading";

interface EnhancedToastOptions {
  title: string;
  description?: string;
  type?: ToastType;
  duration?: number;
}

export function useEnhancedToast() {
  const { toast } = useToast();

  const showToast = ({ title, description, type = "info", duration = 5000 }: EnhancedToastOptions) => {
    const icons = {
      success: "✓",
      error: "✕",
      warning: "⚠",
      info: "ℹ",
      loading: "⟳",
    };

    const variants = {
      success: undefined,
      error: "destructive" as const,
      warning: undefined,
      info: undefined,
      loading: undefined,
    };

    const titleWithIcon = `${icons[type]} ${title}`;

    toast({
      title: titleWithIcon,
      description,
      variant: variants[type],
      duration: type === "loading" ? Infinity : duration,
    });
  };

  return { showToast };
}
