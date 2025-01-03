export interface Project {
    id: string;
    name: string;
    description: string;
    startDate: Date;
    endDate: Date;
    status: 'not started' | 'in progress' | 'completed';
}

export interface ProjectInput {
    name: string;
    description: string;
    startDate: Date;
    endDate: Date;
    status?: 'not started' | 'in progress' | 'completed';
}