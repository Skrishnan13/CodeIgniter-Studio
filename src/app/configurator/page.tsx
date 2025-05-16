
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { FileTree } from '@/components/FileTree';
import { CodePreview } from '@/components/CodePreview';
import { ProjectControls } from '@/components/ProjectControls';
import { configCi4ThroughPrompts, type ConfigCi4ThroughPromptsInput } from '@/ai/flows/config-ci4-prompt';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wand2, Sparkles, MessageSquare, History, ChevronLeft, ChevronRight, FilePlus } from 'lucide-react';
import type { EditorFile, TreeNode } from '@/types';
import { buildFileTree } from '@/lib/file-utils';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface HistoryEntry {
  files: EditorFile[];
  prompt: string;
  nextAiSuggestion?: string;
  selectedFilePath?: string;
}

export default function ConfiguratorPage() {
  const [prompt, setPrompt] = useState<string>('');
  const [currentFiles, setCurrentFiles] = useState<EditorFile[]>([]);
  const [treeNodes, setTreeNodes] = useState<TreeNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<EditorFile | null>(null);
  const [nextAiSuggestion, setNextAiSuggestion] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  const [newFileName, setNewFileName] = useState<string>('');

  useEffect(() => {
    const newTreeNodes = buildFileTree(currentFiles);
    setTreeNodes(newTreeNodes);
  }, [currentFiles]);
  
  useEffect(() => {
    if (nextAiSuggestion) {
      setPrompt(nextAiSuggestion);
    }
  }, [nextAiSuggestion]);

  const updateStateAndHistory = (newFiles: EditorFile[], userPrompt: string, aiSuggestion?: string, newSelectedFilePath?: string) => {
    setCurrentFiles(newFiles);
    setNextAiSuggestion(aiSuggestion);
    
    const newHistoryEntry: HistoryEntry = { files: newFiles, prompt: userPrompt, nextAiSuggestion: aiSuggestion, selectedFilePath: newSelectedFilePath || selectedFile?.path };
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newHistoryEntry);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);

    if (newSelectedFilePath) {
      const newSelected = newFiles.find(f => f.path === newSelectedFilePath);
      if (newSelected) setSelectedFile(newSelected);
    } else if (selectedFile) {
       const updatedSelected = newFiles.find(f => f.path === selectedFile.path);
       if (updatedSelected) setSelectedFile(updatedSelected);
    }
  };

  const loadHistoryState = (index: number) => {
    if (index >= 0 && index < history.length) {
      const historyEntry = history[index];
      setCurrentFiles(historyEntry.files);
      setPrompt(historyEntry.prompt); // Or perhaps don't reset prompt to allow re-running? For now, reset.
      setNextAiSuggestion(historyEntry.nextAiSuggestion);
      setHistoryIndex(index);
      if (historyEntry.selectedFilePath) {
        const newSelected = historyEntry.files.find(f => f.path === historyEntry.selectedFilePath);
        if (newSelected) setSelectedFile(newSelected);
        else setSelectedFile(null);
      } else {
        setSelectedFile(null);
      }
    }
  };

  const handleAddFile = () => {
    if (!newFileName.trim()) {
      toast({ title: "Error", description: "File name cannot be empty.", variant: "destructive" });
      return;
    }
    if (currentFiles.some(f => f.path === newFileName.trim())) {
      toast({ title: "Error", description: "A file with this name already exists.", variant: "destructive" });
      return;
    }
    const newFile: EditorFile = { path: newFileName.trim(), content: `<?php\n\n// ${newFileName.trim()}\n` };
    const updatedFiles = [...currentFiles, newFile];
    updateStateAndHistory(updatedFiles, `Added new file: ${newFileName.trim()}`, undefined, newFile.path);
    setSelectedFile(newFile);
    setNewFileName('');
    toast({ title: "File Added", description: `File "${newFile.path}" created.` });
  };


  const handleSubmit = async () => {
    if (!prompt.trim()) {
      toast({ title: 'Error', description: 'Prompt cannot be empty.', variant: 'destructive' });
      return;
    }
    if (!selectedFile && currentFiles.length > 0) {
      toast({ title: 'Error', description: 'Please select a file to configure or add a new file.', variant: 'destructive' });
      return;
    }
    
    setIsLoading(true);

    try {
      const input: ConfigCi4ThroughPromptsInput = { 
        prompt, 
        currentCode: selectedFile?.content || (currentFiles.length === 0 ? '<?php\n// Start your CodeIgniter 4 code here\n' : '')
      };
      const output = await configCi4ThroughPrompts(input);
      
      let updatedFiles: EditorFile[];
      let newSelectedFilePath = selectedFile?.path;

      if (selectedFile) {
        updatedFiles = currentFiles.map(f => 
          f.path === selectedFile.path ? { ...f, content: output.updatedCode } : f
        );
      } else { // No file selected, implies this is the first file
        const defaultFileName = "new_file.php"; // Or derive from prompt if possible
        newSelectedFilePath = defaultFileName;
        updatedFiles = [{ path: defaultFileName, content: output.updatedCode }];
      }
      
      updateStateAndHistory(updatedFiles, prompt, output.nextPrompt, newSelectedFilePath);
      toast({ title: 'Success', description: 'Configuration applied!' });

    } catch (error) {
      console.error('Error configuring code:', error);
      toast({ title: 'Error', description: 'Failed to apply configuration. Please try again.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (file: EditorFile) => {
    setSelectedFile(file);
    setPrompt(''); // Clear prompt when a new file is selected
    setNextAiSuggestion(undefined); // Clear AI suggestion
  };

  return (
    <TooltipProvider>
    <div className="flex flex-col h-full max-h-[calc(100vh-var(--header-height,10rem))]">
      <Card className="mb-4 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Wand2 className="h-6 w-6 text-primary" /> AI Configurator
          </CardTitle>
          <CardDescription>
            Select a file or add a new one, then use prompts to customize its content step-by-step. The AI will guide you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
            <div>
              <Label htmlFor="configPrompt">Your Prompt</Label>
              <Textarea
                id="configPrompt"
                placeholder="e.g., Create a new public method named 'index' that returns a view."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                disabled={isLoading}
                className="resize-none"
              />
            </div>
            {nextAiSuggestion && (
            <Alert variant="default" className="bg-accent/20 border-accent/50">
                <MessageSquare className="h-4 w-4 text-accent" />
                <AlertTitle className="text-accent">AI Suggestion</AlertTitle>
                <AlertDescription>{nextAiSuggestion}</AlertDescription>
            </Alert>
            )}
            <div className="flex flex-col sm:flex-row gap-2">
              <Button type="submit" disabled={isLoading || (!selectedFile && currentFiles.length > 0)} className="w-full sm:w-auto">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Apply Configuration
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto">
                    <FilePlus className="mr-2 h-4 w-4" /> Add New File
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New File</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="newFileName" className="text-right">File Path</Label>
                      <Input 
                        id="newFileName" 
                        value={newFileName}
                        onChange={(e) => setNewFileName(e.target.value)}
                        className="col-span-3"
                        placeholder="e.g., app/Controllers/MyController.php"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button type="button" onClick={handleAddFile}>Add File</Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </form>
        </CardContent>
         {history.length > 0 && (
          <CardFooter className="flex items-center justify-between border-t pt-4">
            <span className="text-sm text-muted-foreground">History: Step {historyIndex + 1} of {history.length}</span>
            <div className="flex gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={() => loadHistoryState(historyIndex - 1)} disabled={historyIndex <= 0 || isLoading}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Previous (Undo)</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={() => loadHistoryState(historyIndex + 1)} disabled={historyIndex >= history.length - 1 || isLoading}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Next (Redo)</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </CardFooter>
        )}
      </Card>

      {currentFiles.length === 0 && !isLoading && (
         <Alert className="mb-4">
          <Wand2 className="h-4 w-4" />
          <AlertTitle>Ready to Configure!</AlertTitle>
          <AlertDescription>
            Add a new file or provide an initial prompt to generate code. If you add a file, select it from the tree to start configuring.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden min-h-[300px]">
        {treeNodes.length > 0 && (
          <div className="w-full md:w-1/3 lg:w-1/4 h-full md:max-h-full">
            <FileTree nodes={treeNodes} onFileSelect={handleFileSelect} selectedFilePath={selectedFile?.path} className="max-h-full" />
          </div>
        )}
        <div className={cn("flex-1 h-full md:max-h-full", treeNodes.length === 0 && "w-full")}>
           <CodePreview 
            fileName={selectedFile?.path} 
            code={selectedFile?.content} 
            className="max-h-full"
          />
        </div>
      </div>
      <ProjectControls filesToExport={currentFiles} disableExport={currentFiles.length === 0} />
    </div>
    </TooltipProvider>
  );
}

