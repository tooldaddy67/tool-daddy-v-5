'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AdModal from '@/components/ad-modal';
import { useQuota } from '@/hooks/use-quota';
import { useFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';

const EXTERNAL_URL = 'https://imgupscaler.ai/';

export default function AiImageEnhancerClient() {
    const router = useRouter();
    const { toast } = useToast();
    const { user } = useFirebase();
    const { checkQuota, incrementUsage } = useQuota();
    const [isAdModalOpen, setIsAdModalOpen] = useState(false);

    useEffect(() => {
        const checkInitialQuota = async () => {
            const q = await checkQuota('ai-image-enhancer');
            if (q.allowed) {
                setIsAdModalOpen(true);
            } else {
                toast({
                    title: 'Quota Exceeded',
                    description: 'You have reached your daily limit for this tool. Please try again tomorrow.',
                    variant: 'destructive'
                });
                router.replace('/');
            }
        };
        if (user) checkInitialQuota();
        else setIsAdModalOpen(true); // Allow anon for now or redirect to login
    }, [user, checkQuota, router, toast]);

    const handleAdFinish = async () => {
        setIsAdModalOpen(false);
        await incrementUsage('ai-image-enhancer');
        window.location.replace(EXTERNAL_URL);
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
                            Please wait while we redirect you to the AI Image Enhancer.
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
