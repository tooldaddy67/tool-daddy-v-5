import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'Secure Password Generator | Tool Daddy',
  description: 'Generate high-entropy, secure passwords instantly with our customizable Password Generator. Keep your accounts safe.',
  keywords: ['password generator', 'secure password', 'create password', 'password creator', 'random password'],
  openGraph: {
    title: 'Secure Password Generator | Tool Daddy',
    description: 'Generate high-entropy, secure passwords instantly.',
    type: 'website',
  }
};

const PasswordGenerator = dynamic(() => import('./_components/password-generator'), {
  loading: () => <PasswordGeneratorSkeleton />
});

function PasswordGeneratorSkeleton() {
  return (
    <div className="w-full">
      <div className="w-full bg-card/50 backdrop-blur-lg border-border/20 rounded-lg p-6 space-y-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6" />
          <Skeleton className="h-6 w-64" />
        </div>
        <Skeleton className="h-5 w-80" />
        <Skeleton className="h-12 w-full" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PasswordGeneratorPage() {
  return <PasswordGenerator />;
}
