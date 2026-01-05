import { differenceInCalendarDays, eachDayOfInterval, getDay } from 'date-fns';
import type { QuoteState, QuoteSummary, Weekday, QuoteService, Teacher, Coordinator } from '@/types/quote';

/**
 * Map Weekday enum to JavaScript Date.getDay() numbers
 */
const WEEKDAY_MAP: Record<Weekday, number> = {
    'Sunday': 0,
    'Monday': 1,
    'Tuesday': 2,
    'Wednesday': 3,
    'Thursday': 4,
    'Friday': 5,
    'Saturday': 6,
};

/**
 * Calculate total calendar days (inclusive of arrival and departure)
 */
export function calculateCalendarDays(arrivalDate: Date, departureDate: Date): number {
    return differenceInCalendarDays(departureDate, arrivalDate) + 1;
}

/**
 * Calculate number of nights (calendar days - 1)
 */
export function calculateNights(arrivalDate: Date, departureDate: Date): number {
    const days = calculateCalendarDays(arrivalDate, departureDate);
    return Math.max(0, days - 1);
}

/**
 * Calculate number of workdays based on selected active days
 */
export function calculateWorkdays(
    arrivalDate: Date,
    departureDate: Date,
    activeWorkdays: Set<Weekday>
): number {
    if (activeWorkdays.size === 0) return 0;

    const allDays = eachDayOfInterval({ start: arrivalDate, end: departureDate });
    const activeNumbers = Array.from(activeWorkdays).map(day => WEEKDAY_MAP[day]);

    return allDays.filter(date => activeNumbers.includes(getDay(date))).length;
}

/**
 * Calculate cost for a single service based on time basis (cost-only)
 * For optional services, uses participantOverride if set
 */
export function calculateServiceCost(
    service: QuoteService,
    calendarDays: number,
    nights: number,
    workdays: number,
    participants: number
): number {
    if (!service.enabled) return 0;

    let multiplier = 1;

    switch (service.timeBasis) {
        case 'OneOff':
            multiplier = 1;
            break;
        case 'PerDay':
            multiplier = calendarDays;
            break;
        case 'PerNight':
            multiplier = nights;
            break;
        case 'PerWorkday':
            multiplier = workdays;
            break;
    }

    // Use participantOverride for optional services, otherwise use full participant count
    const effectiveParticipants = service.isDefault
        ? participants
        : (service.participantOverride ?? participants);

    return service.costPrice * multiplier * effectiveParticipants;
}

/**
 * Calculate total staff costs
 */
export function calculateStaffCosts(
    teachers: Teacher[],
    coordinator: Coordinator | null,
    teachingHours: number,
    workdays: number,
    calendarDays: number
): { teacherCosts: number; coordinatorCosts: number; totalStaffCosts: number } {
    // Teachers: hourlyRate × teachingHours × workdays (Mon-Fri only)
    const teacherCosts = teachers.reduce((sum, teacher) => {
        return sum + (teacher.hourlyRate * teachingHours * workdays);
    }, 0);

    // Coordinator: dailyRate × calendarDays (includes weekends)
    const coordinatorCosts = coordinator?.enabled
        ? coordinator.dailyRate * calendarDays
        : 0;

    return {
        teacherCosts,
        coordinatorCosts,
        totalStaffCosts: teacherCosts + coordinatorCosts,
    };
}

/**
 * Calculate complete quote summary with Cost-Plus pricing model
 */
export function calculateQuoteSummary(state: QuoteState): QuoteSummary {
    // Validate dates
    if (!state.arrivalDate || !state.departureDate) {
        return {
            calendarDays: 0,
            nights: 0,
            workdays: 0,
            serviceCosts: 0,
            serviceBreakdown: [],
            teacherCosts: 0,
            coordinatorCosts: 0,
            totalStaffCosts: 0,
            staffBreakdown: [],
            contingencyExpenses: 0,
            bankingFees: 0,
            totalOtherCosts: 0,
            otherCostsBreakdown: [],
            baseCost: 0,
            totalInternalCost: 0,
            costPerParticipant: 0,
            manualSellingPricePerParticipant: state.manualSellingPricePerParticipant || 0,
            totalRevenue: 0,
            netProfit: 0,
            profitMarginPercentage: 0,
        };
    }

    // Time calculations
    const calendarDays = calculateCalendarDays(state.arrivalDate, state.departureDate);
    const nights = calculateNights(state.arrivalDate, state.departureDate);
    const workdays = calculateWorkdays(state.arrivalDate, state.departureDate, state.activeWorkdays);

    // Helper to ensure arrays (Firestore might store as objects)
    const toArray = <T,>(data: T[] | Record<string, T> | undefined): T[] => {
        if (!data) return [];
        if (Array.isArray(data)) return data;
        if (typeof data === 'object') return Object.values(data);
        return [];
    };

    const services = toArray(state.services);
    const teachers = toArray(state.teachers);
    const coordinators = toArray(state.coordinators);

    // Service costs breakdown (Stream A - Variable)
    const serviceBreakdown: Array<{ name: string; cost: number }> = [];
    let serviceCosts = 0;

    services.forEach((service) => {
        if (service.enabled) {
            const cost = calculateServiceCost(service, calendarDays, nights, workdays, state.participantCount);
            if (cost > 0) {
                serviceBreakdown.push({ name: service.name, cost });
                serviceCosts += cost;
            }
        }
    });

    // Staff costs breakdown (Stream B - Fixed)
    const staffBreakdown: Array<{ name: string; cost: number }> = [];

    // Teachers
    let teacherCosts = 0;
    teachers.forEach((teacher) => {
        const cost = teacher.hourlyRate * state.standardTeachingHours * workdays;
        if (cost > 0) {
            staffBreakdown.push({ name: `${teacher.name || 'Teacher'} (Teacher)`, cost });
            teacherCosts += cost;
        }
    });

    // Coordinators
    let coordinatorCosts = 0;
    coordinators.forEach((coordinator) => {
        const cost = coordinator.dailyRate * calendarDays;
        if (cost > 0) {
            staffBreakdown.push({ name: `${coordinator.name || 'Coordinator'} (Coordinator)`, cost });
            coordinatorCosts += cost;
        }
    });

    const totalStaffCosts = teacherCosts + coordinatorCosts;

    // Base cost (before other costs)
    const baseCost = serviceCosts + totalStaffCosts;

    // Other costs (percentages of base cost)
    const contingencyExpenses = baseCost * 0.10; // 10%
    const bankingFees = baseCost * 0.03; // 3%
    const totalOtherCosts = contingencyExpenses + bankingFees;
    const otherCostsBreakdown: Array<{ name: string; cost: number }> = [];
    if (contingencyExpenses > 0) {
        otherCostsBreakdown.push({ name: 'Contingency (10%)', cost: contingencyExpenses });
    }
    if (bankingFees > 0) {
        otherCostsBreakdown.push({ name: 'Banking & Wire Fees (3%)', cost: bankingFees });
    }

    // Total internal cost (base + other)
    const totalInternalCost = baseCost + totalOtherCosts;
    const costPerParticipant = state.participantCount > 0 ? totalInternalCost / state.participantCount : 0;

    // Manual pricing (Cost-Plus)
    const manualSellingPricePerParticipant = state.manualSellingPricePerParticipant || 0;
    const totalRevenue = manualSellingPricePerParticipant * state.participantCount;
    const netProfit = totalRevenue - totalInternalCost;
    const profitMarginPercentage = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    return {
        calendarDays,
        nights,
        workdays,
        serviceCosts,
        serviceBreakdown,
        teacherCosts,
        coordinatorCosts,
        totalStaffCosts,
        staffBreakdown,
        contingencyExpenses,
        bankingFees,
        totalOtherCosts,
        otherCostsBreakdown,
        baseCost,
        totalInternalCost,
        costPerParticipant,
        manualSellingPricePerParticipant,
        totalRevenue,
        netProfit,
        profitMarginPercentage,
    };
}
