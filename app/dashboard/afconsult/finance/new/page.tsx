'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Legacy expense form page - redirects to finance page.
 * All transactions are now added via the TransactionDialog component.
 */
export default function NewExpensePage() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to finance page where TransactionDialog is available
        router.replace('/dashboard/afconsult/finance');
    }, [router]);

    return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <p className="text-gray-500 font-sans">Redirecting to Finance...</p>
        </div>
    );
}
