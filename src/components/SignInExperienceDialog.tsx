
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
      <DialogContent className="sm:max-w-xl max-w-[90vw] bg-slate-900 border-slate-700 text-white">
        <DialogHeader className="space-y-4 pb-4">
          <DialogTitle className="text-3xl font-bold text-center text-white leading-tight">
            Get the full Markdown Studio experience
          </DialogTitle>
          <DialogDescription className="text-center text-lg text-slate-300 leading-relaxed px-2">
            You can use the editor <span className="font-semibold text-white">for free</span> with no account. But if you want to{" "}
            <span className="font-semibold text-white">save your edits</span>, keep{" "}
            <span className="font-semibold text-white">access to all your documents and history</span>, and use{" "}
            <span className="font-semibold text-white">clipboard & version management</span> like premium editors,{" "}
            <span className="font-semibold text-white">sign in</span> for the best experience!
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col gap-4 pt-6">
          <Button 
            onClick={handleSignIn} 
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] text-lg h-auto"
          >
            <UserPlus className="w-5 h-5 mr-3" />
            Sign In for Full Experience
            <ArrowRight className="w-5 h-5 ml-3" />
          </Button>
          <Button 
            onClick={handleDismiss} 
            variant="outline" 
            className="w-full border-2 border-slate-600 bg-transparent hover:bg-slate-800 text-slate-300 hover:text-white font-medium py-4 px-8 rounded-xl transition-all duration-300 text-lg h-auto hover:border-slate-500"
          >
            Continue as Guest
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
