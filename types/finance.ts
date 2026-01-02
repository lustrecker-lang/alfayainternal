// Transaction type for general ledger
export interface Transaction {
    id: string;
    unitId: string;
    subProject?: string; // For portfolio units like 'circles' or 'whosfree'
    amount: number;
    currency: 'AED' | 'EUR' | 'USD';
    exchangeRate?: number; // Required if currency is not AED
    amountInAED: number; // Converted amount for reporting
    type: 'INCOME' | 'EXPENSE';
    category: string;
    description?: string;
    proofUrl?: string; // Firebase Storage URL
    createdAt: Date;
    updatedAt: Date;
    createdBy?: string; // User ID who created the transaction
}

// Form data for creating a new transaction
export interface TransactionFormData {
    unitId: string;
    subProject?: string;
    amount: number;
    currency: 'AED' | 'EUR' | 'USD';
    exchangeRate?: number;
    type: 'INCOME' | 'EXPENSE';
    category: string;
    description?: string;
    proofFile?: File;
}

// Transaction categories
export const TRANSACTION_CATEGORIES = {
    INCOME: [
        'Revenue - Service',
        'Revenue - Product',
        'Revenue - Seminar',
        'Revenue - Consulting',
        'Revenue - Subscription',
        'Revenue - Other',
    ],
    EXPENSE: [
        'Expense - Salaries',
        'Expense - Marketing',
        'Expense - Operations',
        'Expense - Infrastructure',
        'Expense - Travel',
        'Expense - Office',
        'Expense - Other',
    ],
};

// Currency symbols
export const CURRENCY_SYMBOLS = {
    AED: 'AED',
    EUR: '€',
    USD: '$',
} as const;

// Summary data for HQ dashboard
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
