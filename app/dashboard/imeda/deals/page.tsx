'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import DealsKanbanBoard from '@/components/deals/DealsKanbanBoard';
import DealModal from '@/components/deals/DealModal';
import { getDeals } from '@/lib/deals';
import type { Deal } from '@/types/deal';

export default function DealsPage() {
    const [deals, setDeals] = useState<Deal[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingDeal, setEditingDeal] = useState<Deal | null>(null);

    useEffect(() => {
        loadDeals();
    }, []);

    const loadDeals = async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const data = await getDeals('imeda');
            setDeals(data);
        } catch (error) {
            console.error('Error loading deals:', error);
        } finally {
            if (!silent) setLoading(false);
        }
    };

    const handleDealsChange = () => {
        loadDeals(true);
    };

    const handleCreateDeal = () => {
        setEditingDeal(null);
        setModalOpen(true);
    };

    const handleEditDeal = (deal: Deal) => {
        setEditingDeal(deal);
        setModalOpen(true);
    };

    const handleModalClose = () => {
        setModalOpen(false);
        setEditingDeal(null);
        handleDealsChange();
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-imeda"></div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6 flex justify-between items-start">
                <div>
                    <h1 className="text-3xl text-gray-900 dark:text-white">Deals</h1>
                </div>
                <button
                    onClick={handleCreateDeal}
                    className="px-4 py-2 bg-imeda text-white hover:opacity-90 rounded-md transition-colors text-sm font-medium flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    New Deal
                </button>
            </div>

            <DealsKanbanBoard
                deals={deals}
                onDealsChange={handleDealsChange}
                onEditDeal={handleEditDeal}
            />

            <DealModal
                isOpen={modalOpen}
                onClose={handleModalClose}
                deal={editingDeal}
            />
        </div>
    );
}
