// ============================================================
// POLYMORPHIC TRANSACTION TYPES
// ============================================================

// === METADATA INTERFACES (Unit-Specific Context) ===

// AFCONSULT Income: Client payment linked to project/invoice
export interface AFConsultIncomeMetadata {
    client_id: string;
    project_id?: string;
    invoice_reference?: string;
}

// AFCONSULT Expense (Direct): Cost linked to a client/project
export interface AFConsultExpenseDirectMetadata {
    client_id: string;
    project_id?: string;
    is_billable: boolean;
}

// AFCONSULT Expense (Operational): General overhead with no client link
export interface AFConsultExpenseOperationalMetadata {
    is_operational: true;
}

// IMEDA: Seminar/education context (placeholder for future)
export interface IMEDAMetadata {
    seminar_id?: string;
    student_pax?: number;
}

// AFTECH: App/product context
export interface AFTechMetadata {
    app_id: string; // "circles" | "whosfree" | "general"
    source?: string; // "stripe", "paypal", "apple", "google"
    is_payout?: boolean;
    server_region?: string;
}

// Union type for all metadata variants
export type TransactionMetadata =
    | AFConsultIncomeMetadata
    | AFConsultExpenseDirectMetadata
    | AFConsultExpenseOperationalMetadata
    | IMEDAMetadata
    | AFTechMetadata;

// === CORE TRANSACTION INTERFACE ===

export interface Transaction {
    id: string;

    // === UNIVERSAL FIELDS (The "Envelope") ===
    date: Date;                    // Transaction date
    vendor?: string;               // Who you paid/received from
    amount: number;                // Original amount (excl. VAT)
    currency: 'AED' | 'EUR' | 'USD' | 'GBP';
    exchangeRate?: number;         // Required if currency is not AED
    amountInAED: number;           // Normalized for reporting
    vatRate: number;               // 0 or 5
    vatAmount: number;             // Calculated VAT amount
    totalAmount: number;           // Amount + VAT
    type: 'INCOME' | 'EXPENSE';
    category: string;
    description?: string;
    proofUrl?: string;             // Firebase Storage URL
    unitId: string;                // "imeda", "afconsult", "aftech"

    // Timestamps
    createdAt: Date;
    updatedAt: Date;
    createdBy?: string;            // User ID who created the transaction

    // === POLYMORPHIC FIELD (The "Letter") ===
    metadata?: TransactionMetadata; // Optional for backwards compatibility
}

// === FORM DATA INTERFACE ===

export interface TransactionFormData {
    date: string;                  // ISO date string
    vendor: string;
    amount: number;
    currency: 'AED' | 'EUR' | 'USD' | 'GBP';
    exchangeRate?: number;
    amountInAED?: number; // Optional override for AED amount
    vatRate: number;
    type: 'INCOME' | 'EXPENSE';
    category: string;
    description?: string;
    proofFile?: File;
    unitId: string;

    // Polymorphic metadata fields (flattened for form state)
    // These get assembled into the metadata object on save
    clientId?: string;
    projectId?: string;
    invoiceReference?: string;
    isBillable?: boolean;
    isOperational?: boolean;
    seminarId?: string;
    studentPax?: number;
    appSlug?: string; // Mapped to app_id
    payoutSource?: string; // For Circles Income
    serverRegion?: string;
}

// === CATEGORIES ===

export const TRANSACTION_CATEGORIES = {
    INCOME: [
        'Revenue - Service',
        'Revenue - Product',
        'Revenue - Seminar',
        'Revenue - Consulting',
        'Revenue - Subscription',
        'Revenue - Marketplace Payout',
        'Revenue - Other',
    ],
    EXPENSE: [
        'Travel & Transport',
        'Accommodation',
        'Meals & Entertainment',
        'Office Supplies',
        'Software & Subscriptions',
        'Professional Services',
        'Marketing & Advertising',
        'Utilities',
        'Salaries & Wages',
        'Infrastructure',
        'Server Costs (AWS/Azure)',
        'App Store Fees',
        'User Acquisition (Ads)',
        'Development Costs',
        'Other',
    ],
};

// === CURRENCY HELPERS ===

export const CURRENCY_SYMBOLS = {
    AED: 'AED',
    EUR: '€',
    USD: '$',
    GBP: '£',
} as const;

export const SUPPORTED_CURRENCIES = ['AED', 'EUR', 'USD', 'GBP'] as const;

// === SUMMARY TYPES ===

export interface FinancialSummary {
    totalIncome: number;
    totalExpenses: number;
    netProfit: number;
    transactionCount: number;
    byUnit: {
        [unitId: string]: {
            income: number;
            expenses: number;
        };
    };
}

// === TYPE GUARDS ===

export function isAFConsultIncome(metadata: TransactionMetadata | undefined): metadata is AFConsultIncomeMetadata {
    return !!metadata && 'client_id' in metadata && !('is_billable' in metadata) && !('is_operational' in metadata);
}

export function isAFConsultExpenseDirect(metadata: TransactionMetadata | undefined): metadata is AFConsultExpenseDirectMetadata {
    return !!metadata && 'is_billable' in metadata;
}

export function isAFConsultExpenseOperational(metadata: TransactionMetadata | undefined): metadata is AFConsultExpenseOperationalMetadata {
    return !!metadata && 'is_operational' in metadata && metadata.is_operational === true;
}

export function isIMEDAMetadata(metadata: TransactionMetadata | undefined): metadata is IMEDAMetadata {
    return !!metadata && 'seminar_id' in metadata;
}

export function isAFTechMetadata(metadata: TransactionMetadata | undefined): metadata is AFTechMetadata {
    return !!metadata && 'app_id' in metadata;
}

// === METADATA BUILDER HELPERS ===

export function buildMetadata(formData: TransactionFormData): TransactionMetadata | undefined {
    const { unitId, type, clientId, projectId, invoiceReference, isBillable, isOperational, seminarId, studentPax, appSlug, payoutSource, serverRegion } = formData;

    // AFCONSULT
    if (unitId === 'afconsult') {
        if (type === 'INCOME') {
            if (!clientId) return undefined;
            return {
                client_id: clientId,
                project_id: projectId || undefined,
                invoice_reference: invoiceReference || undefined,
            } as AFConsultIncomeMetadata;
        } else {
            // EXPENSE
            if (isOperational) {
                return { is_operational: true } as AFConsultExpenseOperationalMetadata;
            }
            if (!clientId) return undefined;
            return {
                client_id: clientId,
                project_id: projectId || undefined,
                is_billable: isBillable || false,
            } as AFConsultExpenseDirectMetadata;
        }
    }

    // IMEDA
    if (unitId === 'imeda') {
        if (seminarId || studentPax) {
            return {
                seminar_id: seminarId || undefined,
                student_pax: studentPax || undefined,
            } as IMEDAMetadata;
        }
        return undefined;
    }

    // AFTECH
    if (unitId === 'aftech') {
        if (appSlug) {
            const metadata: AFTechMetadata = {
                app_id: appSlug, // Mapped from form state
                server_region: serverRegion || undefined,
            };

            // Circles Income Specifics
            if (appSlug === 'circles' && type === 'INCOME' && payoutSource) {
                metadata.source = payoutSource;
                metadata.is_payout = true;
            }

            return metadata;
        }
        return undefined;
    }

    return undefined;
}
