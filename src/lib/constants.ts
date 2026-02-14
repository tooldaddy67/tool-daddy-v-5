
import { type LucideIcon } from 'lucide-react';
import {
  ALL_TOOLS_CATEGORIES,
  ALL_TOOLS as UNIFIED_ALL_TOOLS,
  Tool as UnifiedTool
} from './tools-data';

export type Tool = UnifiedTool;

export type ToolCategory = {
  name: string;
  tools: Tool[];
};

export const TOOL_CATEGORIES: ToolCategory[] = ALL_TOOLS_CATEGORIES.map(cat => ({
  name: cat.title,
  tools: cat.tools
}));

export const ALL_TOOLS: Tool[] = UNIFIED_ALL_TOOLS;
