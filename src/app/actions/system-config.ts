'use server';

import { adminFirestore } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';

export interface SystemConfig {
    maintenanceMode: boolean;
    forceSsl: boolean;
    corsProtection: boolean;
    authorizedOrigins: string;
    publicRateLimit: number;
    authRateLimit: number;
    toolRateLimits?: Record<string, number>;
    lastUpdated?: any;
    updatedBy?: string;
}

const CONFIG_DOC_PATH = 'system/config';

export async function getSystemConfig(): Promise<SystemConfig> {
    try {
        if (!adminFirestore) {
            return getDefaultConfig();
        }
        const doc = await adminFirestore.doc(CONFIG_DOC_PATH).get();
        if (!doc.exists) {
            return getDefaultConfig();
        }

        const data = doc.data() as any;

        // Sanitize data: next.js doesn't like Firestore Timestamps in Client Components
        return {
            maintenanceMode: !!data.maintenanceMode,
            forceSsl: !!data.forceSsl,
            corsProtection: !!data.corsProtection,
            authorizedOrigins: data.authorizedOrigins || 'https://tool-daddy.com',
            publicRateLimit: Number(data.publicRateLimit) || 100,
            authRateLimit: Number(data.authRateLimit) || 1000,
            toolRateLimits: data.toolRateLimits || {},
            // Convert timestamp to primitive or remove it to avoid serialization errors
            lastUpdated: data.lastUpdated?.toDate?.()?.toISOString() || null,
            updatedBy: data.updatedBy || 'system'
        };
    } catch (error) {
        console.error('Failed to fetch system config:', error);
        return getDefaultConfig();
    }
}

import { logAuditEvent } from '@/lib/audit-log';

export async function updateSystemConfig(config: Partial<SystemConfig>, adminUid: string, adminEmail: string = 'system') {
    try {
        if (!adminFirestore) throw new Error('Database connection failed');

        await adminFirestore.doc(CONFIG_DOC_PATH).set({
            ...config,
            lastUpdated: new Date(),
            updatedBy: adminUid
        }, { merge: true });

        // Log the action
        await logAuditEvent({
            action: 'CONFIG_SYNC',
            userEmail: adminEmail,
            userId: adminUid,
            target: 'FIREWALL_V5',
            status: 'success',
            details: { maintenanceMode: config.maintenanceMode }
        });

        revalidatePath('/admin/settings');
        return { success: true };
    } catch (error: any) {
        console.error('Failed to update system config:', error);
        return { success: false, error: error.message };
    }
}

export async function checkMaintenanceMode() {
    const config = await getSystemConfig();
    if (config.maintenanceMode) {
        throw new Error('SITE_MAINTENANCE: The platform is currently undergoing scheduled maintenance. Please try again later.');
    }
}

function getDefaultConfig(): SystemConfig {
    return {
        maintenanceMode: false,
        forceSsl: true,
        corsProtection: true,
        authorizedOrigins: 'https://tool-daddy.com',
        publicRateLimit: 100,
        authRateLimit: 1000,
        toolRateLimits: {
            'ai-text-humanizer': 5,
            'ai-image-enhancer': 2,
            'youtube-downloader': 3
        }
    };
}
