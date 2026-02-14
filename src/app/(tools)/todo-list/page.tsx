import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'Minimalist To-Do List | Tool Daddy',
  description: 'Stay organized and focused with our clean, minimalist to-do list. Manage your tasks, set priorities, and get things done efficiently.',
  keywords: ['online todo list', 'task manager', 'minimalist productivity', 'todo list online', 'get things done'],
  openGraph: {
    title: 'Minimalist To-Do List | Tool Daddy',
    description: 'Stay focused and organized with our minimalist to-do list.',
    type: 'website',
  }
};

const TodoList = dynamic(() => import('./_components/todo-list'), {
  loading: () => <TodoListSkeleton />
});

function TodoListSkeleton() {
  return (
    <div className="w-full min-h-full p-4 grid grid-cols-1 lg:grid-cols-[1fr_2fr_1fr] xl:grid-cols-[1fr_1.5fr_1fr] gap-6 items-start">
      {/* Left Ad Column */}
      <aside className="hidden lg:flex flex-col gap-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </aside>

      {/* Main Content */}
      <main className="w-full h-full flex flex-col gap-6">
        <div className="w-full h-full flex flex-col bg-card/50 backdrop-blur-lg border-border/20 rounded-lg p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Skeleton className="h-8 w-8 hidden sm:block" />
              <div>
                <Skeleton className="h-8 w-40" />
                <Skeleton className="h-4 w-32 mt-2" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-28" />
              <Skeleton className="h-9 w-9" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 flex-grow" />
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-10" />
          </div>
          <div className="space-y-2 pt-4 flex-1">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>

        <div className="bg-muted/50 rounded-lg p-4 h-24 flex items-center justify-center">
          <Skeleton className="h-12 w-48" />
        </div>
      </main>

      {/* Right Ad Column */}
      <aside className="hidden lg:flex flex-col gap-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </aside>
    </div>
  )
}

export default function TodoListPage() {
  return <TodoList />;
}
