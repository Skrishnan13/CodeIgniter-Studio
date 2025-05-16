export interface EditorFile {
  path: string;
  content: string;
}

export interface TreeNode {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'folder';
  content?: string;
  children?: TreeNode[];
}
