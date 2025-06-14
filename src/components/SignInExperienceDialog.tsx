
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Get the full Markdown Studio experience</DialogTitle>
          <DialogDescription className="text-center text-base">
            You can use the editor <b>for free</b> with no account. But if you want to <b>save your edits</b>, keep <b>access to all your documents and history</b>, and use <b>clipboard &amp; version management</b> like premium editors, <b>sign in</b> for the best experience!
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col gap-3 mt-6">
          <Button 
            onClick={handleSignIn} 
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Sign In for Full Experience
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button 
            onClick={handleDismiss} 
            variant="outline" 
            className="w-full border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 font-medium py-3 px-6 rounded-lg transition-all duration-200"
          >
            Continue as Guest
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
