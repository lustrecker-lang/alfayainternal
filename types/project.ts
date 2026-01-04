export interface ProjectTask {
    id: string;
    title: string;
    is_completed: boolean;
}

export interface ProjectMilestone {
    id: string;
    title: string;
    due_date: Date;
    is_completed: boolean;
}

export interface Project {
    id: string;
    name: string;
    clientId: string;
    clientName: string;
    description: string;
    unitId: string;
    status: 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    start_date?: Date;
    due_date?: Date;
    budget?: number;
    tasks?: ProjectTask[];
    milestones?: ProjectMilestone[];
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
