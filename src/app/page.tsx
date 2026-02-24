import dynamic from 'next/dynamic';

const MobileHome = dynamic(() => import('@/components/mobile/mobile-home').then(mod => mod.MobileHome), {
  loading: () => <div className="min-h-screen bg-background animate-pulse" />
});

import { HomeContent } from '@/components/home-content';

export default function Home() {
  return (
    <>
      <MobileHome />
      <HomeContent />
    </>
  );
}
