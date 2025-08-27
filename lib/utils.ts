import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Utility function to handle API responses with authentication checks
 * @param response The fetch response object
 * @param options Configuration options
 * @returns A promise that resolves to the parsed response data or null if there was an error
 */
export async function handleApiResponse<T>(
  response: Response, 
  options: {
    router: ReturnType<typeof useRouter>;
    toast: ReturnType<typeof useToast>['toast'];
    successMessage?: {
      title: string;
      description: string;
    };
    errorMessage?: {
      title: string;
      description: string;
    };
    redirectOnAuthError?: boolean;
  }
): Promise<T | null> {
  const { router, toast, successMessage, errorMessage, redirectOnAuthError = true } = options;
  
  // Handle authentication errors
  if (response.status === 401) {
    toast({
      title: "Authentication required",
      description: "Please sign in to continue",
    });
    
    if (redirectOnAuthError) {
      router.push('/auth/signin');
    }
    
    return null;
  }
  
  // Handle successful responses
  if (response.ok) {
    const data = await response.json() as T;
    
    if (successMessage) {
      toast({
        title: successMessage.title,
        description: successMessage.description,
      });
    }
    
    return data;
  }
  
  // Handle other errors
  try {
    const errorData = await response.json();
    toast({
      title: errorMessage?.title || "Error",
      description: errorData.message || errorData.error || errorMessage?.description || "An error occurred",
      variant: "destructive",
    });
  } catch (e) {
    toast({
      title: errorMessage?.title || "Error",
      description: errorMessage?.description || "An error occurred",
      variant: "destructive",
    });
  }
  
  return null;
}
