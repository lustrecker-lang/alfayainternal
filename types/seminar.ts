export interface SeminarDocument {
    id: string;
    name: string;
    url: string;
    fileType: string;              // pdf, pptx, doc, etc.
    courseId?: string;             // Optional: link to specific course
    uploadedAt: Date;
}

export interface SeminarParticipant {
    id: string;                    // Internal UUID (for React keys/tracking)
    participantId: string;         // Seminar-specific ID (e.g., CAM-2024-001-01)
    clientId: string;              // Company ID
    contactIndex: number;          // Index into client.contacts array

    // Formation (seminar-specific training info)
    attentes?: string;
    objectifPrincipal?: string;
    sujetsSpecifiques?: string;
    niveauConnaissance?: string;

    // Logistique
    flightDetails?: string;

    // Autres
    autresBesoins?: string;
}

export interface ScheduleEvent {
    id: string;
    type: 'course' | 'service' | 'custom';

    // Reference IDs (depending on type)
    courseId?: string;      // If type = 'course'
    serviceId?: string;     // If type = 'service'

    // Common fields
    title: string;          // Display name
    startTime: Date;        // Full datetime
    endTime: Date;          // Full datetime

    // Optional
    notes?: string;
    color?: string;         // Override default color
}

export interface Seminar {
    id: string;                    // Firestore document ID
    seminarId: string;             // Auto-generated: e.g., "LON-2024-001"
    name: string;                  // Seminar title

    // Location
    campusId: string;              // Single campus
    officeIds: string[];           // Multiple offices from that campus

    // Participants (multi-company support)
    participants: SeminarParticipant[];  // NEW: Replaces clientId + participantIds

    // Staff & Courses
    assignedStaffIds: string[];    // IMEDA staff members
    courseIds: string[];           // Multiple courses from Courses module

    // Dates
    startDate: Date;
    endDate: Date;

    // Academic Documents
    documents: SeminarDocument[];

    // Generated Documents (Letters, Certificates)
    generatedDocuments: GeneratedDocument[];

    // Schedule
    schedule: ScheduleEvent[];

    // Metadata
    unitId: string;                // 'imeda'
    createdAt: Date;
    updatedAt?: Date;
}

export interface GeneratedDocument {
    id: string;
    type: 'invitation_letter' | 'certificate' | 'welcome_pack' | 'visa_support' | 'other';
    participantId: string;         // Link to SeminarParticipant.id
    createdAt: Date;
    metadata: Record<string, any>; // Stores variables like embassy name, etc.
}

export type SeminarFormData = Omit<Seminar, 'id' | 'seminarId' | 'createdAt' | 'updatedAt'>;
