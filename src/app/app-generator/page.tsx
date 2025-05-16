"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileTree } from '@/components/FileTree';
import { CodePreview } from '@/components/CodePreview';
import { ProjectControls } from '@/components/ProjectControls';
import { generateCi4App, type GenerateCi4AppInput } from '@/ai/flows/generate-ci4-app';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles } from 'lucide-react';
import type { EditorFile, TreeNode } from '@/types';
import { buildFileTree, parseApplicationCode } from '@/lib/file-utils';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


export default function AppGeneratorPage() {
  const [prompt, setPrompt] = useState<string>('');
  const [generatedFiles, setGeneratedFiles] = useState<EditorFile[]>([]);
  const [treeNodes, setTreeNodes] = useState<TreeNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<EditorFile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      toast({ title: 'Error', description: 'Prompt cannot be empty.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    setGeneratedFiles([]);
    setTreeNodes([]);
    setSelectedFile(null);

    try {
      const input: GenerateCi4AppInput = { prompt };
      const output = await generateCi4App(input);
      
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
        toast({ title: 'Success', description: 'CodeIgniter 4 application generated!' });
      } else {
         toast({ title: 'Notice', description: 'AI generated an empty or unparsable output.', variant: 'default' });
      }

    } catch (error) {
      console.error('Error generating app:', error);
      toast({ title: 'Error', description: 'Failed to generate application. Please try again.', variant: 'destructive' });
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
            <Sparkles className="h-6 w-6 text-primary" /> App Generator
          </CardTitle>
          <CardDescription>
            Describe the CodeIgniter 4 application you want to generate. The AI will create the folder structure and working code.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
            <Textarea
              placeholder="e.g., A simple blog application with posts, comments, and user authentication..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              disabled={isLoading}
              className="resize-none"
            />
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Generate App
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {generatedFiles.length === 0 && !isLoading && (
         <Alert className="mb-4">
          <Sparkles className="h-4 w-4" />
          <AlertTitle>Ready to Generate!</AlertTitle>
          <AlertDescription>
            Enter your app description above and click "Generate App" to see the magic happen.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden min-h-[300px]">
        {treeNodes.length > 0 && (
          <div className="w-full md:w-1/3 lg:w-1/4 h-full md:max-h-full">
            <FileTree nodes={treeNodes} onFileSelect={handleFileSelect} selectedFilePath={selectedFile?.path} className="max-h-full"/>
          </div>
        )}
        <div className={cn("flex-1 h-full md:max-h-full", treeNodes.length === 0 && "w-full")}>
           <CodePreview 
            fileName={selectedFile?.path || (generatedFiles.length > 0 && generatedFiles[0].path ? generatedFiles[0].path : "Output Preview")} 
            code={selectedFile?.content || (generatedFiles.length > 0 && generatedFiles[0].content ? generatedFiles[0].content : "")} 
            className="max-h-full"
          />
        </div>
      </div>
      <ProjectControls filesToExport={generatedFiles} disableExport={generatedFiles.length === 0} />
    </div>
  );
}
