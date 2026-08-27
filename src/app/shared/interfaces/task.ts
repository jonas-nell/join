import { Profile } from './profile';

export interface Task {
    TASK_ID: number;
    task_title: string;
    task_description: string;
    task_due_date: string;
    // genau angeben
    task_priority: string;
    // assignedTo: Profile[] | null;
    // task_category: 'User Story' | 'Technical Task';
    task_category: string;

    // subtask interface
    order_index: number;
    // subtasks: null;
    // status category
    task_status: string;
    subtasks?: Subtask[];
}

export interface TaskChanges {
    task_title: string;
    task_description: string;
    task_due_date: string;
    task_priority: string;
    // assignedTo: Profile[] | null;
    // task_category: 'User Story' | 'Technical Task';
    task_category: string;
    // subtask interface
    // orderIndex
    // subtasks: null;
    task_status: string;
    order_index: number;
}

export interface StatusChange {
    task_status: string;
}

export interface Subtask {
    subtask_title: string;
    // task_id: number;
    completed?: boolean;
}
