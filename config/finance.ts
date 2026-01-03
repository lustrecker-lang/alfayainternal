// ============================================================
// GLOBAL FINANCE CONFIGURATION
// ============================================================

/**
 * Global expense categories organized by group
 * Used across all business units for consistent reporting
 */
export const EXPENSE_CATEGORY_GROUPS = {
    'Consultancy & Professional Services': [
        'Professional Indemnity Insurance',
        'Subcontractor / Associate Fees',
        'Client Acquisition & Proposal Costs',
        'Research & Data Subscriptions',
        'Software – Specialized (e.g., AutoCAD, SPSS)',
        'Intellectual Property (IP) Costs',
        'Referral Fees',
    ],
    'Training & Educational': [
        'Trainer Fees',
        'Training Materials & Kits',
        'Venue Rental (Training)',
        'Guest Speakers',
        'Course Accreditation Fees',
        'LMS Fees (Learning Management System)',
    ],
    'Finance & Banking': [
        'Loan Interest Expense',
        'Loan Principal Repayment',
        'Director Loan Repayment',
        'Credit Card Fees',
        'Bank Fees',
        'International Wire Transfer Fees',
        'Currency Exchange Losses',
        'Invoicing Tools or Payment Gateways',
        'Accounting or Bookkeeping',
        'VAT Payments',
        'Corporate Tax (Provision)',
    ],
    'Travel & Transport': [
        'International Flights',
        'Local Transport (Buses, Shuttles, Taxis)',
        'Airport Transfers',
        'Gas Stations',
        'Tolls',
        'Visa & Immigration Fees',
        'Travel Insurance',
    ],
    'Accommodation': [
        'Hotel Costs',
        'Housing Allowances',
        'Booking Fees',
        'City Tax or Tourist Tax',
    ],
    'Marketing & Business Development': [
        'Marketing & Ads (General)',
        'Ad Spend (Direct to Platforms)',
        'Agency Retainers',
        'Content Production (Photo/Video)',
        'Website Hosting & Domain',
        'Client Entertainment',
        'Gifts for Clients',
    ],
    'Operations & Internal': [
        'Staff Salaries (Internal Team)',
        'End of Service Gratuity',
        'Staff Health Insurance',
        'Recruitment Fees',
        'Software Subscriptions (General)',
        'Office Supplies',
        'Courier & Shipping',
        'Internet & Telephone',
        'Utilities (Electricity & Water)',
        'Office Rent or Coworking Fees',
    ],
    'Logistics & Events': [
        'Event Planners',
        'Event Venue Provider',
        'Logistics Providers',
        'Printing or Signage Vendors',
        'AV Equipment Rental',
    ],
    'Administrative & Legal': [
        'Trade License & Permits',
        'Establishment Card Renewal',
        'Legal Advisory Fees',
        'Notary & Attestation Fees',
        'Emirates ID & Medical Tests',
        'Fines & Penalties',
    ],
    'Activities & Tourism': [
        'Tour Guides / Cultural Tour Operators',
        'Museums or Exhibitions',
        'Event Agencies',
    ],
    'Meals': [
        'Lunch',
        'Coffee Breaks',
        'Welcome or Closing Dinners',
    ],
    'Miscellaneous': [
        'Gifts or Souvenirs for Participants',
        'Insurance Providers (General)',
        'Cleaning Services',
        'Security Services',
        'Charitable Donations',
        'Petty Cash Top-ups',
    ],
} as const;

/**
 * Income category groups
 */
export const INCOME_CATEGORY_GROUPS = {
    'Revenue': [
        'Revenue - Consulting',
        'Revenue - Service',
        'Revenue - Product',
        'Revenue - Seminar',
        'Revenue - Subscription',
        'Revenue - Other',
    ],
} as const;

/**
 * Flat list of all expense categories (for select dropdowns)
 */
export const GLOBAL_CATEGORIES = {
    EXPENSE: Object.values(EXPENSE_CATEGORY_GROUPS).flat(),
    INCOME: Object.values(INCOME_CATEGORY_GROUPS).flat(),
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
