import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'Your Activity History | Tool Daddy',
  description: 'View and manage your recent activity, downloads, and creations on Tool Daddy. Easy access to your past work and secure history management.',
  keywords: ['activity history', 'user downloads', 'past work', 'recent activity', 'tool daddy history'],
  openGraph: {
    title: 'Activity History | Tool Daddy',
    description: 'Manage your recent creations and activity.',
    type: 'website',
  }
};

const HistoryClient = dynamic(() => import('./_components/history-client'), {
  loading: () => (
    <div className="w-full space-y-6 md:mt-0 mt-8">
      <Skeleton className="h-[100px] w-full rounded-2xl" />
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-[300px] w-full rounded-2xl" />
        <Skeleton className="h-[300px] w-full rounded-2xl" />
        <Skeleton className="h-[300px] w-full rounded-2xl" />
      </div>
    </div>
  )
});

export default function HistoryPage() {
  return <HistoryClient />;
}
