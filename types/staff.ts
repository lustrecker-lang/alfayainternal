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

    // Potential future fields
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
