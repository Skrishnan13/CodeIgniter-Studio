"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CodePreviewProps {
  fileName?: string;
  code?: string;
  className?: string;
}

export const CodePreview: React.FC<CodePreviewProps> = ({ fileName, code, className }) => {
  if (!code && !fileName) {
    return (
      <Card className={cn("flex-1 flex items-center justify-center h-full bg-muted/30", className)}>
        <CardContent>
          <p className="text-muted-foreground">Select a file to view its content.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={cn("flex-1 flex flex-col h-full shadow-md overflow-hidden", className)}>
      {fileName && (
        <CardHeader className="py-3 px-4 border-b">
          <CardTitle className="text-base font-medium truncate">{fileName}</CardTitle>
        </CardHeader>
      )}
      <CardContent className="p-0 flex-1 overflow-hidden">
        <ScrollArea className="h-full w-full">
          {code ? (
            <pre className="text-sm p-4 whitespace-pre-wrap break-all font-mono">
              <code>{code}</code>
            </pre>
          ) : (
            <div className="p-4 text-muted-foreground">No content for this file.</div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
