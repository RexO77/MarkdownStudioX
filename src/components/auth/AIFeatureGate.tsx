
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Sparkles } from 'lucide-react';

interface AIFeatureGateProps {
  children: React.ReactNode;
  feature: string;
  description?: string;
  showUpgrade?: boolean;
}

export const AIFeatureGate = ({ 
  children, 
  feature, 
  description,
  showUpgrade = true 
}: AIFeatureGateProps) => {
  const { user } = useAuth();

  if (user) {
    return <>{children}</>;
  }

  if (!showUpgrade) {
    return null;
  }

  return (
    <Card className="border-2 border-dashed border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardHeader className="text-center pb-3">
        <div className="flex justify-center mb-2">
          <div className="p-2 rounded-full bg-primary/10">
            <Lock className="h-5 w-5 text-primary" />
          </div>
        </div>
        <CardTitle className="text-lg">AI Feature: {feature}</CardTitle>
        {description && (
          <CardDescription className="text-sm">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-sm text-muted-foreground mb-4">
          Sign in for free to unlock AI-powered features
        </p>
        <Button 
          onClick={() => window.location.href = '/auth'}
          className="w-full"
        >
          <Sparkles className="mr-2 h-4 w-4" />
          Sign In to Unlock
        </Button>
      </CardContent>
    </Card>
  );
};

export const AIFeatureTooltip = ({ feature }: { feature: string }) => {
  const { user } = useAuth();

  if (user) return null;

  return (
    <div className="absolute -top-2 -right-2 z-10">
      <div className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full flex items-center gap-1">
        <Lock className="h-3 w-3" />
        Pro
      </div>
    </div>
  );
};
