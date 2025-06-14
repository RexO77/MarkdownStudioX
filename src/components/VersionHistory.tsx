
import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DocumentVersion } from '@/hooks/useDocuments';
import { Clock, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VersionHistoryProps {
  versions: DocumentVersion[];
  onRestore: (version: DocumentVersion) => void;
  isOpen: boolean;
  onClose: () => void;
}

const VersionHistory = ({ versions, onRestore, isOpen, onClose }: VersionHistoryProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-80 bg-background border-l shadow-lg">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Version History
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>
        </div>

        {/* Versions List */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-3">
            {versions.map((version, index) => (
              <div
                key={version.id}
                className={cn(
                  "p-3 rounded-lg border transition-colors",
                  index === 0 && "border-primary bg-primary/5"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">
                        Version {version.version_number}
                      </span>
                      {index === 0 && (
                        <span className="text-xs px-2 py-1 bg-primary text-primary-foreground rounded">
                          Current
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">
                      {new Date(version.created_at).toLocaleString()}
                    </p>
                    
                    {version.change_summary && (
                      <p className="text-sm text-foreground mb-2">
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
                      onClick={() => onRestore(version)}
                      className="flex-shrink-0"
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Restore
                    </Button>
                  )}
                </div>
              </div>
            ))}
            
            {versions.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No version history</p>
                <p className="text-sm">Versions will appear as you save</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default VersionHistory;
