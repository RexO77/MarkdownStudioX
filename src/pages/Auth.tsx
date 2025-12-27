
import React, { useEffect } from 'react';
import { useUser, SignIn } from '@clerk/clerk-react';

const Auth = () => {
  const { isSignedIn, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      window.location.href = '/';
    }
  }, [isLoaded, isSignedIn]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="w-full max-w-md">
        <SignIn 
          routing="path" 
          path="/auth" 
          signUpUrl="/auth" 
          afterSignInUrl="/"
          appearance={{
            elements: {
              formButtonPrimary: 
                "bg-primary hover:bg-primary/90 text-primary-foreground",
              card: "shadow-lg border border-border",
              headerTitle: "text-foreground",
              headerSubtitle: "text-muted-foreground",
            },
            variables: {
              colorPrimary: "hsl(var(--primary))",
              colorBackground: "hsl(var(--background))",
              colorText: "hsl(var(--foreground))",
              colorTextSecondary: "hsl(var(--muted-foreground))",
              borderRadius: "0.5rem"
            }
          }}
          fallback={
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          }
        />
      </div>
    </div>
  );
};

export default Auth;
