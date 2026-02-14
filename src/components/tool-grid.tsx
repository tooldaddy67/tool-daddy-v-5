
'use client';

import { TOOL_CATEGORIES } from '@/lib/constants';
import DynamicToolCard from '@/components/dynamic-tool-card';
import { useSettings } from '@/components/settings-provider';

export default function ToolGrid() {
  const { settings } = useSettings();
  let toolIndex = 0;

  const getGridClass = () => {
    switch (settings.uiDensity) {
      case 'cozy':
        return 'grid-cols-1';
      case 'compact': // Revert to 3 cols for wider cards, matching standard but with compact height
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
      case 'standard':
      default:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
    }
  };

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
          <div className={`grid gap-10 ${getGridClass()}`}>
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
                  compact={settings.uiDensity === 'compact'}
                />
              );
            })}
          </div>
        </div>
      ))}
    </>
  );
}
