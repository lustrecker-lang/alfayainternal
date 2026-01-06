'use client';

import { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors, useDroppable } from '@dnd-kit/core';
import { ChevronDown, ChevronRight } from 'lucide-react';
import DealCard from './DealCard';
import { updateDealStage } from '@/lib/deals';
import { showToast } from '@/lib/toast';
import type { Deal, DealStage } from '@/types/deal';

interface DealsKanbanBoardProps {
    deals: Deal[];
    onDealsChange: () => void;
    onEditDeal: (deal: Deal) => void;
}

const STAGES = [
    { id: 'cold', label: '❄️ Cold', emoji: '❄️' },
    { id: 'warm', label: '🔥 Warm', emoji: '🔥' },
    { id: 'hot', label: '🔥🔥 Hot', emoji: '🔥🔥' },
    { id: 'won', label: '🎉 Won', emoji: '🎉', collapsible: true },
] as const;

interface KanbanColumnProps {
    stage: typeof STAGES[number];
    deals: Deal[];
    isExpanded: boolean;
    onToggle: () => void;
    onEditDeal: (deal: Deal) => void;
}

function KanbanColumn({ stage, deals, isExpanded, onToggle, onEditDeal }: KanbanColumnProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: stage.id,
    });

    const isWonColumn = stage.id === 'won';
    const showDeals = !isWonColumn || isExpanded;

    return (
        <div
            ref={setNodeRef}
            className={`flex flex-col h-full rounded-lg transition-colors ${isOver ? 'ring-2 ring-imeda ring-opacity-50 bg-gray-50/50 dark:bg-zinc-800/50' : ''}`}
        >
            {/* Column Header */}
            <div
                className={`p-3 rounded-t-lg border-b-2 ${stage.id === 'cold' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500' :
                    stage.id === 'warm' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-500' :
                        stage.id === 'hot' ? 'bg-red-50 dark:bg-red-900/20 border-red-500' :
                            'bg-green-50 dark:bg-green-900/20 border-green-500'
                    }`}
            >
                {isWonColumn ? (
                    <button
                        onClick={(e) => {
                            e.preventDefault(); // Prevent bubbling issues
                            onToggle();
                        }}
                        className="w-full flex items-center justify-between text-sm font-medium text-gray-900 dark:text-white hover:opacity-80 transition-opacity"
                        title="Collapse column"
                    >
                        <span>{stage.label} ({deals.length})</span>
                        <ChevronDown className="w-4 h-4" />
                    </button>
                ) : (
                    <div className="flex items-center justify-between text-sm font-medium text-gray-900 dark:text-white">
                        <span>{stage.label}</span>
                        <span className="text-xs bg-white dark:bg-gray-700 px-2 py-0.5 rounded-full">
                            {deals.length}
                        </span>
                    </div>
                )}
            </div>

            {/* Column Content (Droppable Area) */}
            {showDeals && (
                <div
                    className="flex-1 p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-b-lg min-h-[200px] space-y-3"
                >
                    {deals.map(deal => (
                        <DealCard
                            key={deal.id}
                            deal={deal}
                            onClick={() => onEditDeal(deal)}
                        />
                    ))}
                    {deals.length === 0 && (
                        <div className="h-full flex items-center justify-center text-gray-400 text-xs italic min-h-[50px]">
                            Drop here
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default function DealsKanbanBoard({ deals, onDealsChange, onEditDeal }: DealsKanbanBoardProps) {
    const [wonExpanded, setWonExpanded] = useState(false);
    const [activeDrag, setActiveDrag] = useState<Deal | null>(null);
    const [optimisticDeals, setOptimisticDeals] = useState<Deal[]>(deals);

    // Sync optimistic state with props when they change (e.g. after fetch)
    useEffect(() => {
        setOptimisticDeals(deals);
    }, [deals]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const handleDragStart = (event: any) => {
        const dealId = event.active.id;
        const deal = optimisticDeals.find(d => d.id === dealId);
        setActiveDrag(deal || null);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveDrag(null);

        if (!over) return;

        const dealId = active.id as string;
        const newStage = over.id as DealStage;

        // If dropped in same stage, do nothing
        const deal = optimisticDeals.find(d => d.id === dealId);
        if (deal && deal.stage === newStage) return;

        // Optimistic update
        const previousDeals = [...optimisticDeals];
        setOptimisticDeals(prev => prev.map(d =>
            d.id === dealId ? { ...d, stage: newStage } : d
        ));

        // If moved to Won, ensure Won is expanded to show it? 
        // Or user can manually expand. Let's keep it manual per user preference.

        try {
            await updateDealStage(dealId, newStage);
            onDealsChange();
        } catch (error) {
            console.error('Error moving deal:', error);
            showToast.error('Failed to move deal');
            setOptimisticDeals(previousDeals); // Revert on failure
        }
    };

    const getDealsByStage = (stage: DealStage) => {
        return optimisticDeals.filter(d => d.stage === stage);
    };

    const wonCount = optimisticDeals.filter(d => d.stage === 'won').length;

    return (
        <div>
            {/* Won Toggle (Visible when collapsed) */}
            {!wonExpanded && (
                <div className="flex justify-end mb-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <button
                        onClick={() => setWonExpanded(true)}
                        className="flex items-center gap-1 px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800 rounded-md text-sm font-medium hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors shadow-sm"
                        title={`Show Won Deals (${wonCount})`}
                    >
                        <span>🎉</span>
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}

            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className={`grid grid-cols-1 md:grid-cols-2 ${wonExpanded ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-4 transition-all duration-300 ease-in-out`}>
                    {STAGES.map(stage => {
                        // Skip rendering Won column if collapsed
                        if (stage.id === 'won' && !wonExpanded) return null;

                        return (
                            <KanbanColumn
                                key={stage.id}
                                stage={stage}
                                deals={getDealsByStage(stage.id as DealStage)}
                                onEditDeal={onEditDeal}
                                isExpanded={stage.id === 'won' ? wonExpanded : true}
                                onToggle={() => {
                                    if (stage.id === 'won') {
                                        setWonExpanded(!wonExpanded);
                                    }
                                }}
                            />
                        );
                    })}
                </div>

                <DragOverlay>
                    {activeDrag && (
                        <div className="opacity-75 rotate-2 scale-105 transition-transform cursor-grabbing">
                            <DealCard deal={activeDrag} onClick={() => { }} />
                        </div>
                    )}
                </DragOverlay>
            </DndContext>
        </div>
    );
}
