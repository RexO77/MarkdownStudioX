
import React from 'react';
import { Button } from '@/components/ui/button';
import { DocumentVersion } from '@/types/document';
import { RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VersionItemProps {
  version: DocumentVersion;
  index: number;
  onRestore: (version: DocumentVersion) => void;
}

const VersionItem = ({ version, index, onRestore }: VersionItemProps) => {
  const handleRestore = () => {
    if (window.confirm(`Are you sure you want to restore to version ${version.version_number}? This will create a new version with the restored content.`)) {
      onRestore(version);
    }
  };

  return (
    <div
      className={cn(
        "p-3 rounded-lg border transition-all duration-200 hover:shadow-md transform hover:scale-[1.02]",
        index === 0 
          ? "border-primary bg-primary/5 shadow-sm" 
          : "border-border hover:border-primary/50"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium">
              Version {version.version_number}
            </span>
            {index === 0 && (
              <span className="text-xs px-2 py-1 bg-primary text-primary-foreground rounded animate-pulse">
                Current
              </span>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground mb-2">
            {new Date(version.created_at).toLocaleString()}
          </p>
          
          {version.change_summary && (
            <p className="text-sm text-foreground mb-2 bg-muted/50 p-2 rounded text-xs">
              {version.change_summary}
            </p>
          )}
          
          <p className="text-xs text-muted-foreground truncate">
            {version.title}
          </p>
        </div>
        
        {index !== 0 && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleRestore}
            className="flex-shrink-0 hover:bg-primary hover:text-primary-foreground transition-all duration-200 hover:scale-105"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Restore
          </Button>
        )}
      </div>
    </div>
  );
};

export default VersionItem;
