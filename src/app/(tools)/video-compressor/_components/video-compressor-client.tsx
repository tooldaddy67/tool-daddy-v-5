'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AdModal from '@/components/ad-modal';

interface VideoCompressorClientProps {
    externalUrl: string;
}

export default function VideoCompressorClient({ externalUrl }: VideoCompressorClientProps) {
    const router = useRouter();
    const [isAdModalOpen, setIsAdModalOpen] = useState(true);

    const handleAdFinish = () => {
        setIsAdModalOpen(false);
        window.location.replace(externalUrl);
    };

    const handleModalClose = () => {
        setIsAdModalOpen(false);
        router.replace('/');
    }

    return (
        <>
            <div className="w-full max-w-4xl mx-auto p-4 md:p-8">
                <Card className="bg-card/50 backdrop-blur-lg border-border/20">
                    <CardHeader>
                        <CardTitle>Redirecting...</CardTitle>
                        <CardDescription>
                            Please wait while we redirect you to the Video Compressor.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-center items-center h-64 border-2 border-dashed rounded-lg bg-background/30">
                            <div className="text-center">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto" />
                                <p className="mt-4 text-muted-foreground">Preparing the external tool...</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <AdModal
                isOpen={isAdModalOpen}
                onClose={handleModalClose}
                onAdFinish={handleAdFinish}
                title="Redirecting you to our partner..."
                duration={10}
            />
        </>
    );
}
