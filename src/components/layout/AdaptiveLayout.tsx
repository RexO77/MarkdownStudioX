
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { useFocusMode } from './FocusMode';
import { Button } from '@/components/ui/button';
import { PanelLeft, PanelRight, Maximize2, Minimize2 } from 'lucide-react';

interface AdaptiveLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  rightPanel?: React.ReactNode;
  className?: string;
}

export function AdaptiveLayout({ 
  children, 
  sidebar, 
  rightPanel, 
  className 
}: AdaptiveLayoutProps) {
  const { mode, isZenMode, isDistractionFree } = useFocusMode();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const shouldHideSidebar = isZenMode || isDistractionFree || sidebarCollapsed;
  const shouldHideRightPanel = isZenMode || isDistractionFree || rightPanelCollapsed;

  return (
    <div className={cn(
      'flex h-screen bg-background transition-all duration-300',
      isFullscreen && 'fixed inset-0 z-50',
      className
    )}>
      {/* Sidebar */}
      {sidebar && (
        <div className={cn(
          'border-r bg-card/50 backdrop-blur-sm transition-all duration-300',
          shouldHideSidebar ? 'w-0 overflow-hidden' : 'w-64'
        )}>
          {sidebar}
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Layout Controls */}
        <div className="flex justify-between items-center p-2 border-b bg-background/80 backdrop-blur-sm">
          <div className="flex gap-1">
            {sidebar && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="h-7 w-7 p-0"
              >
                <PanelLeft className="h-3 w-3" />
              </Button>
            )}
          </div>
          
          <div className="flex gap-1">
            {rightPanel && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)}
                className="h-7 w-7 p-0"
              >
                <PanelRight className="h-3 w-3" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="h-7 w-7 p-0"
            >
              {isFullscreen ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
            </Button>
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 flex">
          <div className="flex-1">
            {children}
          </div>
          
          {/* Right Panel */}
          {rightPanel && (
            <div className={cn(
              'border-l bg-card/50 backdrop-blur-sm transition-all duration-300',
              shouldHideRightPanel ? 'w-0 overflow-hidden' : 'w-80'
            )}>
              {rightPanel}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
