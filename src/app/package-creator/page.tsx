
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileTree } from '@/components/FileTree';
import { CodePreview } from '@/components/CodePreview';
import { ProjectControls } from '@/components/ProjectControls';
import { createCi4Package, type CreateCi4PackageInput } from '@/ai/flows/create-ci4-package';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PackagePlus, Sparkles } from 'lucide-react';
import type { EditorFile, TreeNode } from '@/types';
import { buildFileTree, parseApplicationCode } from '@/lib/file-utils';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export default function PackageCreatorPage() {
  const [packageDescription, setPackageDescription] = useState<string>('');
  const [projectName, setProjectName] = useState<string>('MyCi4Project');
  const [generatedFiles, setGeneratedFiles] = useState<EditorFile[]>([]);
  const [treeNodes, setTreeNodes] = useState<TreeNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<EditorFile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!packageDescription.trim() || !projectName.trim()) {
      toast({ title: 'Error', description: 'Package description and project name cannot be empty.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    setGeneratedFiles([]);
    setTreeNodes([]);
    setSelectedFile(null);

    try {
      const input: CreateCi4PackageInput = { packageDescription, projectName };
      const output = await createCi4Package(input);
      
      const parsedFiles = parseApplicationCode(output.applicationCode);
      setGeneratedFiles(parsedFiles);

      if (parsedFiles.length > 0) {
        const newTreeNodes = buildFileTree(parsedFiles);
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
        toast({ title: 'Success', description: 'CodeIgniter 4 project scaffold with package created!' });
      } else {
        toast({ title: 'Notice', description: 'AI generated an empty or unparsable output.', variant: 'default' });
      }

    } catch (error) {
      console.error('Error creating project with package:', error);
      toast({ title: 'Error', description: 'Failed to create project. Please try again.', variant: 'destructive' });
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
            <PackagePlus className="h-6 w-6 text-primary" /> Package-Focused Project Creator
          </CardTitle>
          <CardDescription>
            Describe a CodeIgniter 4 package (e.g., authentication, blog). The AI will generate a full project scaffold with this package integrated, including necessary files and a .env template.
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
              <Label htmlFor="packageDescription">Package Description</Label>
              <Textarea
                id="packageDescription"
                placeholder="e.g., A user authentication package with registration, login, and password reset."
                value={packageDescription}
                onChange={(e) => setPackageDescription(e.target.value)}
                rows={4}
                disabled={isLoading}
                className="resize-none"
              />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Create Project with Package
            </Button>
          </form>
        </CardContent>
      </Card>

      {generatedFiles.length === 0 && !isLoading && (
         <Alert className="mb-4">
          <PackagePlus className="h-4 w-4" />
          <AlertTitle>Ready to Create!</AlertTitle>
          <AlertDescription>
            Describe your package and project name, then click "Create Project with Package".
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
      <ProjectControls 
        filesToExport={generatedFiles} 
        disableExport={generatedFiles.length === 0}
        projectName={projectName} 
      />
    </div>
  );
}
