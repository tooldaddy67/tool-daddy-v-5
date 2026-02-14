import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'Simple Online Notepad | Tool Daddy',
  description: 'A clean, fast, and secure online notepad. Type, save, and manage your notes directly in your browser with auto-save and easy export options.',
  keywords: ['online notepad', 'secure notes', 'browser notepad', 'quick notes', 'text editor online', 'web notepad'],
  openGraph: {
    title: 'Simple Online Notepad | Tool Daddy',
    description: 'Your secure and fast online scratchpad.',
    type: 'website',
  }
};

const SimpleNotepad = dynamic(() => import('./_components/simple-notepad'), {
  loading: () => <SimpleNotepadSkeleton />
});

function SimpleNotepadSkeleton() {
  return (
    <div className="w-full h-full p-4 md:p-6">
      <div className="w-full h-full flex flex-col bg-card/50 backdrop-blur-lg border-border/20 rounded-lg">
        <div className="p-6 flex flex-row justify-between items-center">
          <div>
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-4 w-96 mt-2" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
        <div className="px-6 pb-6 flex-grow flex flex-col relative overflow-y-auto">
          <Skeleton className="flex-grow w-full" />
        </div>
        <div className="p-6 pt-0 text-sm text-muted-foreground justify-between items-center flex-shrink-0 flex">
          <div className="flex gap-4">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-10 w-10" />
        </div>
      </div>
    </div>
  )
}

export default function SimpleNotepadPage() {
  return <SimpleNotepad />;
}
