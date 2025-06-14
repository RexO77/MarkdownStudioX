
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserPlus, ArrowRight } from "lucide-react";

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
    <Dialog open={open} onOpenChange={(val) => { if (!val) handleDismiss(); }}>
      <DialogContent
        className="
          max-w-[94vw] sm:max-w-lg 
          border border-neutral-200 dark:border-slate-700 
          bg-white dark:bg-slate-900
          shadow-xl
          rounded-2xl
          animate-scale-in animate-fade-in
          p-0
          transition-all
          data-[state=open]:animate-scale-in
        "
        style={{
          animation: "fade-in 0.17s cubic-bezier(0.4,0,0.2,1), scale-in 0.21s cubic-bezier(0.4,0,0.2,1)"
        }}
      >
        <DialogHeader className="px-6 pt-7 pb-2">
          <DialogTitle className="text-[1.8rem] sm:text-2xl font-bold text-center text-gray-900 dark:text-white mb-1">
            Get the full Markdown Studio experience
          </DialogTitle>
          <DialogDescription className="mt-2 text-center text-base text-gray-600 dark:text-slate-300 leading-relaxed px-0 sm:px-2">
            You can use the editor <span className="font-medium text-black dark:text-white">for free</span> with no account.<br />
            But if you want to <span className="font-semibold text-black dark:text-white">save your edits</span>, keep <span className="font-semibold">access to all your documents and history</span>, and use <span className="font-semibold">clipboard &amp; version management</span> like premium editors,<br className="hidden sm:block" />
            <span className="font-semibold text-black dark:text-white">sign in</span> for the best experience!
          </DialogDescription>
        </DialogHeader>
        <DialogFooter
          className="flex flex-col sm:flex-row justify-center gap-3 px-6 pb-7 pt-3"
        >
          <Button
            onClick={handleSignIn}
            className={`
              w-full sm:w-auto justify-center px-6 py-3 text-base font-semibold
              rounded-lg shadow-none border border-transparent
              bg-blue-600 hover:bg-blue-700 text-white transition
              focus:ring-2 focus:ring-blue-400
              flex items-center gap-2
              duration-150
            `}
            style={{
              minWidth: 0,
            }}
          >
            <UserPlus className="w-5 h-5" />
            <span>Sign In for Full Experience</span>
            <ArrowRight className="w-5 h-5" />
          </Button>
          <Button
            variant="outline"
            onClick={handleDismiss}
            className={`
              w-full sm:w-auto justify-center px-6 py-3 text-base font-medium
              rounded-lg shadow-none border border-neutral-300 dark:border-slate-600
              bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-200
              hover:bg-neutral-100 dark:hover:bg-slate-800
              transition duration-150
              flex items-center gap-2
              focus:ring-2 focus:ring-primary
            `}
            style={{
              minWidth: 0,
            }}
          >
            Continue as Guest
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
