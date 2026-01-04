export interface Consultant {
    id: string;
    name: string;
    rate: number;
    expertise: string;
    email?: string;
    phone?: string;
    bio?: string;
    joinedDate: Date; // Stored as Timestamp in Firestore
    unitId: string; // 'afconsult'
    status: 'active' | 'archived';

    employeeId?: string; // Format: 00000
    avatarUrl?: string;
    documents?: StaffDocument[];
}

export interface StaffDocument {
    id: string;
    name: string;
    url: string;
    uploadDate: Date;
    size?: string;
}

export type NewConsultantData = Omit<Consultant, 'id'>;
