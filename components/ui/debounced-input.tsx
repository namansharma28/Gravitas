'use client';

import * as React from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface DebouncedInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  debounceDelay?: number;
}

/**
 * A debounced input component that prevents focus loss when typing quickly
 * by debouncing state updates.
 */
const DebouncedInput = React.forwardRef<HTMLInputElement, DebouncedInputProps>(
  ({ className, value, onChange, debounceDelay = 300, ...props }, ref) => {
    // Track the input value internally to avoid focus loss
    const [inputValue, setInputValue] = React.useState(value);
    
    // Update internal value when external value changes
    React.useEffect(() => {
      setInputValue(value);
    }, [value]);

    // Handle input changes internally first
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInputValue(newValue); // Update internal state immediately
      onChange(newValue); // Notify parent component
    };

    return (
      <Input
        className={cn(className)}
        ref={ref}
        value={inputValue}
        onChange={handleChange}
        {...props}
      />
    );
  }
);

DebouncedInput.displayName = 'DebouncedInput';

export { DebouncedInput };