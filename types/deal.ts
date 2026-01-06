export type DealStage = 'cold' | 'warm' | 'hot' | 'won';

export interface DealNote {
    id: string;
    content: string;
    createdAt: Date;
    createdBy?: string;
    isSystem?: boolean;
}

export interface Deal {
    id: string;
    name: string;
    stage: DealStage;
    clientId?: string;
    clientName?: string;
    quoteIds: string[];
    invoiceIds: string[];
    notes: string; // Legacy field, kept for backward compatibility
    noteLog: DealNote[];
    amount?: number;
    createdAt: Date;
    updatedAt: Date;
    unitId: string;
}

export interface DealFormData {
    name: string;
    stage: DealStage;
    clientId?: string;
    clientName?: string;
    quoteIds?: string[];
    invoiceIds?: string[];
    notes?: string;
    noteLog?: DealNote[];
}
