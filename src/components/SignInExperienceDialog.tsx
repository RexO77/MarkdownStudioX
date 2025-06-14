
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Get the full Markdown Studio experience</DialogTitle>
          <DialogDescription>
            You can use the editor <b>for free</b> with no account. But if you want to <b>save your edits</b>, keep <b>access to all your documents and history</b>, and use <b>clipboard &amp; version management</b> like premium editors, <b>sign in</b> for the best experience!
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col gap-2">
          <Button onClick={handleSignIn} variant="default" className="w-full">Sign In (Recommended)</Button>
          <Button onClick={handleDismiss} variant="ghost" className="w-full">Continue without account</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
