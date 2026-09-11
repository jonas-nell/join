import { Profile } from './profile';

export interface Task {
    TASK_ID: number;
    task_title: string;
    task_description: string;
    task_due_date: string;
    task_priority: string;
    task_category: string;

    // subtask interface
    order_index: number;
    task_status: string;
    subtasks?: Subtask[];
}

export interface TaskChanges {
    task_title: string;
    task_description: string;
    task_due_date: string;
    task_priority: string;
    task_category: string;
    task_status: string;
    order_index: number;
}

export interface StatusChange {
    task_status: string;
}

export interface Subtask {
    id?: number;
    subtask_title: string;
    task_id?: number;
    subtask_done: boolean;
}
