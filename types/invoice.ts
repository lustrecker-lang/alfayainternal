import type { Currency, BankAccount } from './settings';

export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'VOID' | 'OVERDUE';

export interface InvoiceItem {
    id: string;
    description: string;
    details?: string; // Additional lighter description
    quantity: number;
    rate: number;
    amount: number;
}

export interface Invoice {
    id: string;
    unit_id: string;
    invoice_number: string;
    client_id: string;
    client_name: string;

    // Holding Company / Issuer Info (Snapshot)
    holding_company_name?: string;
    holding_company_address?: string;
    holding_company_trn?: string;
    holding_company_trade_license?: string;
    holding_company_email?: string;
    holding_company_phone?: string;

    date_issue: Date;
    date_due: Date;

    items: InvoiceItem[];
    subtotal: number;
    vat_rate: number;
    vat_amount: number;
    total_amount: number;
    currency: Currency;

    status: InvoiceStatus;
    notes?: string;
    bank_account?: BankAccount;

    createdAt: Date;
    updatedAt: Date;
}

export interface NewInvoiceData {
    unit_id: string;
    invoice_number: string;
    client_id: string;
    client_name: string;

    // Holding Company Snapshot
    holding_company_name?: string;
    holding_company_address?: string;
    holding_company_trn?: string;
    holding_company_trade_license?: string;
    holding_company_email?: string;
    holding_company_phone?: string;

    date_issue: string | Date;
    date_due: string | Date;

    items: InvoiceItem[];
    subtotal: number;
    vat_rate: number;
    vat_amount: number;
    total_amount: number;
    currency: Currency;

    status: InvoiceStatus;
    notes?: string;
    bank_account?: BankAccount;
}
