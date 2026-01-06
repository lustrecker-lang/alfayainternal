export interface SeminarDocument {
    id: string;
    name: string;
    url: string;
    fileType: string;              // pdf, pptx, doc, etc.
    courseId?: string;             // Optional: link to specific course
    uploadedAt: Date;
}

export interface Seminar {
    id: string;                    // Firestore document ID
    seminarId: string;             // Auto-generated: e.g., "LON-2024-001"
    name: string;                  // Seminar title

    // Location
    campusId: string;              // Single campus
    officeIds: string[];           // Multiple offices from that campus

    // Client & Participants
    clientId: string;              // Single client
    participantIds: string[];      // Indexes into client.contacts array (or contact IDs)

    // Staff & Courses
    assignedStaffIds: string[];    // IMEDA staff members
    courseIds: string[];           // Multiple courses from Courses module

    // Dates
    startDate: Date;
    endDate: Date;

    // Academic Documents
    documents: SeminarDocument[];

    // Metadata
    unitId: string;                // 'imeda'
    createdAt: Date;
    updatedAt?: Date;
}

export type SeminarFormData = Omit<Seminar, 'id' | 'seminarId' | 'createdAt' | 'updatedAt'>;
