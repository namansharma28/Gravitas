"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

interface SuccessAnimationProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

export function SuccessAnimation({ message, size = "md" }: SuccessAnimationProps) {
  const sizes = {
    sm: "h-12 w-12",
    md: "h-16 w-16",
    lg: "h-24 w-24",
  };

  const iconSizes = {
    sm: 24,
    md: 32,
    lg: 48,
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
        }}
        className={`${sizes[size]} rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center`}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <CheckCircle2 
            className="text-green-600 dark:text-green-400" 
            size={iconSizes[size]} 
          />
        </motion.div>
      </motion.div>
      
      {message && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center font-medium"
        >
          {message}
        </motion.p>
      )}
    </div>
  );
}
