
import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DocumentVersion } from '@/hooks/useDocuments';
import { Clock, RotateCcw, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VersionHistoryProps {
  versions: DocumentVersion[];
  onRestore: (version: DocumentVersion) => void;
  isOpen: boolean;
  onClose: () => void;
}

const VersionHistory = ({ versions, onRestore, isOpen, onClose }: VersionHistoryProps) => {
  if (!isOpen) return null;

  const handleRestore = (version: DocumentVersion) => {
    if (window.confirm(`Are you sure you want to restore to version ${version.version_number}? This will create a new version with the restored content.`)) {
      onRestore(version);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed inset-y-0 right-0 z-50 w-80 bg-background border-l shadow-xl transform transition-transform duration-300 ease-out">
        <div className="flex flex-col h-full">
          {/* Header */}
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

          {/* Versions List */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-3">
              {versions.length > 0 ? (
                versions.map((version, index) => (
                  <div
                    key={version.id}
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
                          onClick={() => handleRestore(version)}
                          className="flex-shrink-0 hover:bg-primary hover:text-primary-foreground transition-all duration-200 hover:scale-105"
                        >
                          <RotateCcw className="h-3 w-3 mr-1" />
                          Restore
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="font-medium">No version history</p>
                  <p className="text-sm">Save your document to create versions</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </>
  );
};

export default VersionHistory;
