"use client";

import { Button } from "@/components/ui/button";
import { Download, History } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProjectControlsProps {
  onExport?: () => void;
  onShowHistory?: () => void;
  disableExport?: boolean;
  disableHistory?: boolean;
  filesToExport?: { path: string; content: string }[]; // Simplified export
}

export const ProjectControls: React.FC<ProjectControlsProps> = ({
  onExport,
  onShowHistory,
  disableExport,
  disableHistory,
  filesToExport
}) => {
  const { toast } = useToast();

  const handleExport = () => {
    if (onExport) {
      onExport();
    } else if (filesToExport && filesToExport.length > 0) {
      // Basic placeholder for ZIP functionality
      // In a real app, use a library like JSZip
      console.log("Exporting files:", filesToExport);
      toast({
        title: "Export Initiated (Placeholder)",
        description: `${filesToExport.length} file(s) ready for export. Check console. Full ZIP functionality requires a library.`,
      });
    } else {
       toast({
        title: "Nothing to Export",
        description: "Generate or create some files first.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex gap-2 p-4 border-t bg-card">
      <Button onClick={handleExport} disabled={disableExport || !filesToExport || filesToExport.length === 0}>
        <Download className="mr-2 h-4 w-4" />
        Export Project
      </Button>
      {onShowHistory && (
        <Button variant="outline" onClick={onShowHistory} disabled={disableHistory}>
          <History className="mr-2 h-4 w-4" />
          History
        </Button>
      )}
    </div>
  );
};
