export interface CourseModule {
    title: string;
    order: number;
}

export interface Course {
    id: string;
    formationId: string;
    domain: string;
    title: string;
    objective: string;
    prerequisites: string;
    audience: string;
    methods: string;
    resources: string;
    evaluation: string;
    modules: CourseModule[];
    unitId: string; // To associate with IMEDA unit
    createdAt?: Date;
    updatedAt?: Date;
}
