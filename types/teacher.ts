// ============================================================
// IMEDA TEACHER TYPES
// ============================================================

export interface BankDetails {
    bankName: string;
    accountName: string;
    accountNumber: string;
    iban?: string;
    swiftCode?: string;
}

export interface ContactDetails {
    email: string;
    phone?: string;
    address?: string;
}

export interface ImedaTeacher {
    id: string;
    fullName: string;
    domains: string[]; // Course domains (e.g., "Quality Management", "Digital Skills")
    contact: ContactDetails;
    bankDetails: BankDetails;
    createdAt: Date;
    updatedAt: Date;
}
