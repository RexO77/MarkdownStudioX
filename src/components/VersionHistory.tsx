
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DocumentVersion } from '@/types/document';
import VersionHistoryHeader from './version-history/VersionHistoryHeader';
import VersionItem from './version-history/VersionItem';
import EmptyVersionState from './version-history/EmptyVersionState';

interface VersionHistoryProps {
  versions: DocumentVersion[];
  onRestore: (version: DocumentVersion) => void;
  isOpen: boolean;
  onClose: () => void;
}

const VersionHistory = ({ versions, onRestore, isOpen, onClose }: VersionHistoryProps) => {
  if (!isOpen) return null;

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
          <VersionHistoryHeader onClose={onClose} />

          {/* Versions List */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-3">
              {versions.length > 0 ? (
                versions.map((version, index) => (
                  <VersionItem
                    key={version.id}
                    version={version}
                    index={index}
                    onRestore={onRestore}
                  />
                ))
              ) : (
                <EmptyVersionState />
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </>
  );
};

export default VersionHistory;
