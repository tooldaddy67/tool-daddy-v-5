'use server';

import { getAdminDb } from '@/lib/firebase-admin';
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
    return getDefaultConfig();
}

export async function updateSystemConfig(config: Partial<SystemConfig>, adminUid: string, adminEmail: string = 'system') {
    console.log('[SystemConfig] Update ignored in database-free mode:', config);
    return { success: true };
}

export async function checkMaintenanceMode() {
    // Maintenance mode disabled in database-free mode
    return;
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
