
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserPlus, X } from "lucide-react";

const SESSION_KEY = "md-studio-signin-dialog-dismissed";

export function SignInExperienceDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Only show if they haven't dismissed it this session
    const dismissed = sessionStorage.getItem(SESSION_KEY);
    if (!dismissed) setOpen(true);
  }, []);

  const handleDismiss = () => {
    setOpen(false);
    sessionStorage.setItem(SESSION_KEY, "1");
  };

  const handleSignIn = () => {
    window.location.href = "/auth";
  };

  return (
    <Dialog open={open} onOpenChange={handleDismiss}>
      <DialogContent className="sm:max-w-md max-w-[90vw] p-0 gap-0 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute right-4 top-4 z-10 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        {/* Header */}
        <DialogHeader className="px-6 pt-8 pb-4 text-center">
          <DialogTitle className="text-xl font-semibold">
            Get the full experience
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-2">
            Save your work, access history, and unlock all features
          </DialogDescription>
        </DialogHeader>

        {/* Content */}
        <div className="px-6 pb-6">
          <div className="space-y-3">
            <Button
              onClick={handleSignIn}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              size="sm"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Sign In
            </Button>
            <Button
              onClick={handleDismiss}
              variant="ghost"
              className="w-full text-muted-foreground hover:text-foreground"
              size="sm"
            >
              Continue as Guest
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
