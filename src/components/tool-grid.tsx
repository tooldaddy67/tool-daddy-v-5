
'use client';

import { TOOL_CATEGORIES } from '@/lib/constants';
import DynamicToolCard from '@/components/dynamic-tool-card';

export default function ToolGrid() {
  let toolIndex = 0;
  return (
    <>
      {TOOL_CATEGORIES.map((category) => (
        <div key={category.name} className="space-y-12">
          <div className="flex items-center gap-4">
            <div className="h-10 w-1.5 bg-red-500 rounded-full" />
            <h2 className="text-3xl font-black font-headline tracking-tighter uppercase">
              {category.name}
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            {category.tools.map((tool) => {
              const currentIndex = toolIndex++;
              return (
                <DynamicToolCard
                  key={tool.name}
                  href={tool.href}
                  name={tool.name}
                  description={tool.description}
                  icon={tool.icon}
                  isExternal={tool.isExternal}
                  variantIndex={currentIndex}
                />
              );
            })}
          </div>
        </div>
      ))}
    </>
  );
}
