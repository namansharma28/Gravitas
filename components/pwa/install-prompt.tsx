"use client";

import { useState, useEffect } from "react";
import { X, Download, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if user has dismissed the prompt before
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    const dismissedTime = dismissed ? parseInt(dismissed) : 0;
    const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);

    // Don't show if dismissed within last 7 days
    if (daysSinceDismissed < 7) {
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt after 30 seconds of usage
      setTimeout(() => {
        setShowPrompt(true);
      }, 30000);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
        localStorage.setItem('pwa-install-dismissed', Date.now().toString());
      }

      setDeferredPrompt(null);
      setShowPrompt(false);
    } catch (error) {
      console.error('Error showing install prompt:', error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  if (isInstalled || !showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96"
      >
        <Card className="border-2 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Smartphone className="h-5 w-5 text-primary" />
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold">Install Gravitas</h3>
                    <p className="text-sm text-muted-foreground">
                      Install our app for a better experience
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0"
                    onClick={handleDismiss}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleInstall} size="sm" className="flex-1">
                    <Download className="mr-2 h-4 w-4" />
                    Install
                  </Button>
                  <Button onClick={handleDismiss} variant="outline" size="sm">
                    Not Now
                  </Button>
                </div>

                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li>✓ Works offline</li>
                  <li>✓ Faster loading</li>
                  <li>✓ Push notifications</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
