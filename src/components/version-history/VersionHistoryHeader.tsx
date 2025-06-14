
import React from 'react';
import { Button } from '@/components/ui/button';
import { Clock, X } from 'lucide-react';

interface VersionHistoryHeaderProps {
  onClose: () => void;
}

const VersionHistoryHeader = ({ onClose }: VersionHistoryHeaderProps) => {
  return (
    <div className="p-4 border-b bg-background/95 backdrop-blur">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Version History
        </h2>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose}
          className="hover:bg-accent transition-all duration-200 hover:scale-105"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default VersionHistoryHeader;
