'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import QuoteEditor from '@/components/quotes/QuoteEditor';
import { getQuote } from '@/lib/quotes';
import type { Quote } from '@/types/quote';

export default function EditQuotePage() {
    const params = useParams();
    const id = params.id as string;
    const [quote, setQuote] = useState<Quote | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadQuote();
    }, [id]);

    const loadQuote = async () => {
        try {
            const data = await getQuote(id);
            setQuote(data);
        } catch (error) {
            console.error('Error loading quote:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-imeda"></div>
            </div>
        );
    }

    return <QuoteEditor quote={quote} />;
}
