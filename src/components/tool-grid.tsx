
'use client';

import { TOOL_CATEGORIES } from '@/lib/constants';
import DynamicToolCard from '@/components/dynamic-tool-card';

export default function ToolGrid() {
  let toolIndex = 0;
  return (
    <>
      {TOOL_CATEGORIES.map((category) => (
        <div key={category.name} className="space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold font-headline tracking-tight">
            {category.name}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
