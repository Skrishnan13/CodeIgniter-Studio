"use client";

import type { TreeNode, EditorFile } from '@/types';
import { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, Folder, FolderOpen, FileText } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FileTreeProps {
  nodes: TreeNode[];
  onFileSelect: (file: EditorFile) => void;
  selectedFilePath?: string;
  className?: string;
}

interface FileTreeNodeProps {
  node: TreeNode;
  onFileSelect: (file: EditorFile) => void;
  selectedFilePath?: string;
  level: number;
  expandedFolders: Set<string>;
  toggleFolder: (folderId: string) => void;
}

const FileTreeNodeItem: React.FC<FileTreeNodeProps> = ({ node, onFileSelect, selectedFilePath, level, expandedFolders, toggleFolder }) => {
  const isFolder = node.type === 'folder';
  const isExpanded = isFolder && expandedFolders.has(node.id);

  const handleNodeClick = () => {
    if (isFolder) {
      toggleFolder(node.id);
    } else if (node.content !== undefined) {
      onFileSelect({ path: node.path, content: node.content });
    }
  };

  const Icon = isFolder ? (isExpanded ? FolderOpen : Folder) : FileText;
  const indentStyle = { paddingLeft: `${level * 1.5}rem` };

  return (
    <div>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "w-full justify-start h-8 px-2 py-1 text-sm rounded-md",
          selectedFilePath === node.path && "bg-accent text-accent-foreground"
        )}
        onClick={handleNodeClick}
        style={indentStyle}
        aria-expanded={isFolder ? isExpanded : undefined}
      >
        {isFolder && (
          isExpanded ? <ChevronDown className="h-4 w-4 mr-1 shrink-0" /> : <ChevronRight className="h-4 w-4 mr-1 shrink-0" />
        )}
        <Icon className="h-4 w-4 mr-2 shrink-0" />
        <span className="truncate">{node.name}</span>
      </Button>
      {isExpanded && node.children && node.children.length > 0 && (
        <div>
          {node.children.map((childNode) => (
            <FileTreeNodeItem
              key={childNode.id}
              node={childNode}
              onFileSelect={onFileSelect}
              selectedFilePath={selectedFilePath}
              level={level + 1}
              expandedFolders={expandedFolders}
              toggleFolder={toggleFolder}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const FileTree: React.FC<FileTreeProps> = ({ nodes, onFileSelect, selectedFilePath, className }) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Automatically expand parent folders of the selected file
    if (selectedFilePath) {
      const parts = selectedFilePath.split('/');
      let currentPathId = 'root';
      const newExpanded = new Set(expandedFolders);
      for (let i = 0; i < parts.length - 1; i++) {
        currentPathId += `/${parts[i]}`;
        newExpanded.add(currentPathId);
      }
      setExpandedFolders(newExpanded);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFilePath]);


  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };
  
  if (!nodes || nodes.length === 0) {
    return <div className={cn("p-4 text-sm text-muted-foreground", className)}>No files to display.</div>;
  }

  return (
    <ScrollArea className={cn("h-full w-full p-2 rounded-md border bg-card", className)}>
      <div className="space-y-0.5">
        {nodes.map(node => (
          <FileTreeNodeItem
            key={node.id}
            node={node}
            onFileSelect={onFileSelect}
            selectedFilePath={selectedFilePath}
            level={0}
            expandedFolders={expandedFolders}
            toggleFolder={toggleFolder}
          />
        ))}
      </div>
    </ScrollArea>
  );
};
