'use client';

import { SettingsContent } from '@/components/settings-content';

export default function SettingsPage() {
    return (
        <div className="h-full w-full pb-20 md:pb-0">
            <SettingsContent isDialog={false} />
        </div>
    );
}
