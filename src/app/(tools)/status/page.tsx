import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'Service Status | Tool Daddy',
  description: 'Check the real-time status and availability of all Tool Daddy services and AI tools. Get live updates on system performance and uptime.',
  keywords: ['system status', 'tool daddy status', 'service uptime', 'ai service status', 'uptime monitor'],
  openGraph: {
    title: 'Service Status | Tool Daddy',
    description: 'Live status of all Tool Daddy services.',
    type: 'website',
  }
};

const StatusClient = dynamic(() => import('./_components/status-client'), {
  loading: () => (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-8">
      <Skeleton className="h-[400px] w-full rounded-2xl" />
    </div>
  )
});

export default function StatusPage() {
  return <StatusClient />;
}
