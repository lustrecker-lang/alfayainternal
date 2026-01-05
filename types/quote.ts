// ============================================================
// QUOTE MODULE TYPES
// ============================================================

/**
 * Time basis for calculating service costs
 */
export type TimeBasis = 'OneOff' | 'PerDay' | 'PerNight' | 'PerWorkday';

/**
 * Days of the week for workday selection
 */
export type Weekday = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

/**
 * Teacher staff member for quote (hourly rate, billed per workday only)
 * Links to ImedaTeacher from teachers collection
 */
export interface Teacher {
    id: string; // Unique ID for this quote entry
    teacherId?: string; // Reference to ImedaTeacher.id
    name: string;
    hourlyRate: number; // Rate in selected currency
}

/**
 * Coordinator staff member (daily rate, billed per calendar day)
 * Links to Consultant from staff collection
 */
export interface Coordinator {
    id: string; // Unique ID for this quote entry
    staffId?: string; // Reference to Consultant.id
    name: string;
    dailyRate: number; // Rate in selected currency
    enabled: boolean;
}

/**
 * Service with cost-only pricing for quotes (no selling price)
 */
export interface QuoteService {
    serviceId: string;
    name: string;
    description: string;
    timeBasis: TimeBasis;
    costPrice: number; // Internal cost per unit (the ONLY price)
    enabled: boolean;
    imageUrl?: string;
    isDefault?: boolean; // Default services use full participant count
    participantOverride?: number; // For optional services: how many participants need this
}

/**
 * Complete quote state
 */
export interface QuoteState {
    // Global Settings
    arrivalDate: Date | null;
    departureDate: Date | null;
    participantCount: number;
    activeWorkdays: Set<Weekday>;

    // Staffing
    standardTeachingHours: number;
    teachers: Teacher[];
    coordinators: Coordinator[];

    // Services (Cost-only, no selling prices)
    services: QuoteService[];

    // Manual Pricing (Cost-Plus Model)
    manualSellingPricePerParticipant: number;

    // Metadata
    quoteName?: string;
    campusId?: string;
    clientId?: string;
    notes?: string;
}

/**
 * Calculated financial summary (Cost-Plus Model)
 */
export interface QuoteSummary {
    // Time calculations
    calendarDays: number;
    nights: number;
    workdays: number;

    // Service costs (Variable - Stream A)
    serviceCosts: number;
    serviceBreakdown: Array<{ name: string; cost: number }>; // For receipt display

    // Staff costs (Fixed - Stream B)
    teacherCosts: number;
    coordinatorCosts: number;
    totalStaffCosts: number;
    staffBreakdown: Array<{ name: string; cost: number }>; // For receipt display

    // Other costs (percentages)
    contingencyExpenses: number; // 10% of base costs
    bankingFees: number; // 3% of base costs
    totalOtherCosts: number;
    otherCostsBreakdown: Array<{ name: string; cost: number }>;

    // Totals (Cost-only)
    baseCost: number; // Services + Staff (before other costs)
    totalInternalCost: number; // Base + Other costs
    costPerParticipant: number;

    // Manual Pricing (Revenue from user input)
    manualSellingPricePerParticipant: number;
    totalRevenue: number;
    netProfit: number;
    profitMarginPercentage: number;
}

/**
 * Saved quote document (Firestore)
 */
export interface Quote {
    id: string;
    unitId: string; // Always 'imeda'

    // Quote data
    quoteName: string;
    arrivalDate: Date;
    departureDate: Date;
    participantCount: number;
    activeWorkdays: Weekday[];

    // Staffing
    standardTeachingHours: number;
    teachers: Teacher[];
    coordinators: Coordinator[];

    // Services
    services: QuoteService[];

    // Manual Pricing (Cost-Plus Model)
    manualSellingPricePerParticipant: number;

    // Calculated summary (snapshot at save time)
    summary: QuoteSummary;

    // Metadata
    campusId?: string;
    clientId?: string;
    notes?: string;
    status: 'draft' | 'sent' | 'accepted' | 'rejected';

    // Timestamps
    createdAt: Date;
    updatedAt: Date;
    createdBy?: string;
}

/**
 * Form data for creating/editing quotes
 */
export interface QuoteFormData {
    quoteName: string;
    arrivalDate: string; // ISO date string
    departureDate: string; // ISO date string
    participantCount: number;
    activeWorkdays: Weekday[];
    standardTeachingHours: number;
    campusId?: string;
    clientId?: string;
    notes?: string;
}
