export interface Project {
    id: string;
    name: string;
    clientId: string;
    clientName: string; // Denormalized for easy display
    description: string;
    unitId: string;
    status: 'active' | 'archived';
    createdAt: Date;
    updatedAt: Date;
}

export interface NewProjectData {
    name: string;
    clientId: string;
    clientName: string;
    description: string;
    unitId: string;
}
