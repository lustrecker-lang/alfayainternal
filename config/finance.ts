// ============================================================
// GLOBAL FINANCE CONFIGURATION
// ============================================================

/**
 * Global expense/income categories
 * Used across all business units for consistent reporting
 */
export const GLOBAL_CATEGORIES = {
    EXPENSE: [
        'Marketing',
        'Software & Subscriptions',
        'Travel & Transport',
        'Accommodation',
        'Rent',
        'Legal & Professional',
        'Salaries & Wages',
        'Office Supplies',
        'Bank Fees',
        'Utilities',
        'Meals & Entertainment',
        'Insurance',
        'Training & Education',
        'Other',
    ],
    INCOME: [
        'Revenue - Consulting',
        'Revenue - Service',
        'Revenue - Product',
        'Revenue - Seminar',
        'Revenue - Subscription',
        'Revenue - Other',
    ],
} as const;

/**
 * Supported currencies with display info
 */
export const CURRENCIES = {
    AED: { code: 'AED', name: 'UAE Dirham', symbol: 'AED' },
    USD: { code: 'USD', name: 'US Dollar', symbol: '$' },
    EUR: { code: 'EUR', name: 'Euro', symbol: '€' },
    GBP: { code: 'GBP', name: 'British Pound', symbol: '£' },
} as const;

export const SUPPORTED_CURRENCIES = ['AED', 'USD', 'EUR', 'GBP'] as const;

/**
 * VAT rates available in UAE
 */
export const VAT_RATES = [
    { value: 0, label: '0% (Exempt)' },
    { value: 5, label: '5% (Standard)' },
] as const;

/**
 * Calculate VAT from gross amount (backwards calculation)
 * Used when the user enters the total from their bank statement
 * 
 * @param grossAmount - Total amount including VAT
 * @param vatRate - VAT rate as percentage (e.g., 5 for 5%)
 * @param vatIncluded - Whether VAT is included in the gross amount
 */
export function calculateVATFromGross(
    grossAmount: number,
    vatRate: number,
    vatIncluded: boolean
): { netAmount: number; vatAmount: number; totalAmount: number } {
    if (vatIncluded) {
        // Backwards calculation: Gross = Net + VAT = Net + (Net * rate) = Net * (1 + rate)
        // So: Net = Gross / (1 + rate)
        const netAmount = grossAmount / (1 + vatRate / 100);
        const vatAmount = grossAmount - netAmount;
        return {
            netAmount: Math.round(netAmount * 100) / 100,
            vatAmount: Math.round(vatAmount * 100) / 100,
            totalAmount: grossAmount,
        };
    } else {
        // Forward calculation: Net is the input, add VAT on top
        const vatAmount = grossAmount * (vatRate / 100);
        return {
            netAmount: grossAmount,
            vatAmount: Math.round(vatAmount * 100) / 100,
            totalAmount: Math.round((grossAmount + vatAmount) * 100) / 100,
        };
    }
}

/**
 * Calculate implied exchange rate from foreign and AED amounts
 * 
 * @param foreignAmount - Amount in foreign currency
 * @param aedAmount - Amount deducted from bank in AED
 */
export function calculateExchangeRate(
    foreignAmount: number,
    aedAmount: number
): number {
    if (foreignAmount <= 0) return 0;
    return Math.round((aedAmount / foreignAmount) * 10000) / 10000;
}
