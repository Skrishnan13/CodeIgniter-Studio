"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileTree } from '@/components/FileTree';
import { CodePreview } from '@/components/CodePreview';
import { ProjectControls } from '@/components/ProjectControls';
import { createCi4Module, type CreateCi4ModuleInput } from '@/ai/flows/create-ci4-module';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PackagePlus, Sparkles } from 'lucide-react';
import type { EditorFile, TreeNode } from '@/types';
import { buildFileTree } from '@/lib/file-utils';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export default function ModuleCreatorPage() {
  const [moduleDescription, setModuleDescription] = useState<string>('');
  const [projectName, setProjectName] = useState<string>('MyCi4Project');
  const [generatedFiles, setGeneratedFiles] = useState<EditorFile[]>([]);
  const [treeNodes, setTreeNodes] = useState<TreeNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<EditorFile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!moduleDescription.trim() || !projectName.trim()) {
      toast({ title: 'Error', description: 'Module description and project name cannot be empty.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    setGeneratedFiles([]);
    setTreeNodes([]);
    setSelectedFile(null);

    try {
      const input: CreateCi4ModuleInput = { moduleDescription, projectName };
      const output = await createCi4Module(input);
      
      if (output.moduleFiles && output.moduleFiles.length > 0) {
        setGeneratedFiles(output.moduleFiles);
        const newTreeNodes = buildFileTree(output.moduleFiles);
        setTreeNodes(newTreeNodes);
        // Auto-select the first file if available
        if (newTreeNodes.length > 0) {
           const firstNode = newTreeNodes[0];
           if(firstNode.type === 'file' && firstNode.content){
             setSelectedFile({ path: firstNode.path, content: firstNode.content });
           } else if (firstNode.type === 'folder' && firstNode.children && firstNode.children.length > 0 && firstNode.children[0].type === 'file' && firstNode.children[0].content) {
             setSelectedFile({ path: firstNode.children[0].path, content: firstNode.children[0].content });
           }
        }
        toast({ title: 'Success', description: 'CodeIgniter 4 module created!' });
      } else {
        toast({ title: 'Notice', description: 'AI generated an empty module.', variant: 'default' });
      }

    } catch (error) {
      console.error('Error creating module:', error);
      toast({ title: 'Error', description: 'Failed to create module. Please try again.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (file: EditorFile) => {
    setSelectedFile(file);
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-var(--header-height,10rem))]">
      <Card className="mb-4 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <PackagePlus className="h-6 w-6 text-primary" /> Module Creator
          </CardTitle>
          <CardDescription>
            Describe the CodeIgniter 4 module you want (e.g., authentication, blog). The AI will generate the necessary files.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
            <div>
              <Label htmlFor="projectName">Project Name</Label>
              <Input
                id="projectName"
                type="text"
                placeholder="e.g., MyCi4Project"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="moduleDescription">Module Description</Label>
              <Textarea
                id="moduleDescription"
                placeholder="e.g., A user authentication module with registration, login, and password reset."
                value={moduleDescription}
                onChange={(e) => setModuleDescription(e.target.value)}
                rows={4}
                disabled={isLoading}
                className="resize-none"
              />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Create Module
            </Button>
          </form>
        </CardContent>
      </Card>

      {generatedFiles.length === 0 && !isLoading && (
         <Alert className="mb-4">
          <PackagePlus className="h-4 w-4" />
          <AlertTitle>Ready to Create!</AlertTitle>
          <AlertDescription>
            Describe your module and project name, then click "Create Module".
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
      <ProjectControls filesToExport={generatedFiles} disableExport={generatedFiles.length === 0} />
    </div>
  );
}
