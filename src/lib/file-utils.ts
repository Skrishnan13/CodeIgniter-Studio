import type { TreeNode, EditorFile } from '@/types';

export function buildFileTree(files: EditorFile[]): TreeNode[] {
  const root: TreeNode = { id: 'root', name: 'root', path: '', type: 'folder', children: [] };

  files.forEach(file => {
    const parts = file.path.split('/');
    let currentLevel = root.children!;
    let currentPath = '';
    let cumulativePathId = 'root';

    parts.forEach((part, index) => {
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      cumulativePathId = `${cumulativePathId}/${part}`;
      const isLastPart = index === parts.length - 1;
      
      let node = currentLevel.find(n => n.name === part && (isLastPart ? n.type === 'file' : n.type === 'folder'));

      if (!node) {
        node = {
          id: cumulativePathId,
          name: part,
          path: currentPath,
          type: isLastPart ? 'file' : 'folder',
          children: isLastPart ? undefined : [],
          content: isLastPart ? file.content : undefined,
        };
        currentLevel.push(node);
      }

      if (!isLastPart && node.type === 'folder') {
        if(!node.children) node.children = []; // ensure children array exists
        currentLevel = node.children;
      }
    });
  });

  const sortNodes = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => {
      if (a.type === 'folder' && b.type === 'file') return -1;
      if (a.type === 'file' && b.type === 'folder') return 1;
      return a.name.localeCompare(b.name);
    });
    nodes.forEach(node => {
      if (node.children) sortNodes(node.children);
    });
  };
  
  if (root.children) {
    sortNodes(root.children);
    return root.children;
  }
  return [];
}

// Heuristic parser for applicationCode string from generateCi4App
export function parseApplicationCode(appCode: string): EditorFile[] {
  const files: EditorFile[] = [];
  // Regex to find file path comments and their content
  // Example: // File: app/Controllers/Home.php OR /* File: app/Controllers/Home.php */
  const fileRegex = /(?:\/\/|\/\*)\s*File:\s*([\w\/\-\.]+)\s*(?:\*\/)?\r?\n([\s\S]*?)(?=(?:\/\/|\/\*)\s*File:|$)/g;
  
  let match;
  while ((match = fileRegex.exec(appCode)) !== null) {
    const path = match[1].trim();
    const content = match[2].trim();
    if (path && content) {
      files.push({ path, content });
    }
  }

  // If no files were parsed using the comment structure, treat the whole string as a single file.
  if (files.length === 0 && appCode.trim().length > 0) {
    files.push({ path: 'application_output.txt', content: appCode });
  }
  
  return files;
}
