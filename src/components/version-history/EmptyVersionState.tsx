
import React from 'react';
import { AlertCircle } from 'lucide-react';

const EmptyVersionState = () => {
  return (
    <div className="text-center py-8 text-muted-foreground">
      <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
      <p className="font-medium">No version history</p>
      <p className="text-sm">Save your document to create versions</p>
    </div>
  );
};

export default EmptyVersionState;
