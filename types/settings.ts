export interface Address {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
}

export interface Country {
    id: string; // ISO code or uuid
    name: string;
    code: string; // ISO 3166-1 alpha-2
    flag?: string; // Emoji
}

export type Currency = 'AED' | 'EUR' | 'USD';

export interface BankAccount {
    id: string; // uuid
    bank_name: string;
    account_name: string; // Internal Label
    holder_name: string; // Account Holder Name
    account_number: string;
    iban: string;
    swift_code: string;
    bank_address: string;
    currency: Currency;
    is_default: boolean;
}

export interface CompanyProfile {
    legal_name: string;
    trade_license_number?: string;
    trn_number: string;
    contact_email?: string;
    contact_phone?: string;
    address: Address;
    logo_url?: string;
    stamp_url?: string;
    signature_url?: string;
    signed_stamp_url?: string;
    bank_accounts: BankAccount[];
    updatedAt?: Date;
}

export interface DocumentLayout {
    showLogo: boolean;
    showHeaderAddress: boolean;
    showDate: boolean;
    dateAlignment: 'left' | 'right';
    showSubject: boolean;
    showFooter: boolean;
    customFooter?: string;
    showSignature: boolean;
    showStamp: boolean;
    signatureText?: string;
}

export interface DocumentTemplate {
    id: string;
    name: string;
    type: 'invitation_letter' | 'certificate' | 'visa_support' | 'welcome_pack' | 'other';
    // If empty or null, applies to ALL campuses
    campusIds: string[];
    subject: string;
    subtitle?: string;
    body: string; // Markdown supported
    layout?: DocumentLayout;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
