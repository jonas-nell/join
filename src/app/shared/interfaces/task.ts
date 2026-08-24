import { Profile } from './profile';

export interface Task {
    TASK_ID: string;
    task_title: string;
    task_description: string | null;
    task_due_date: string;
    // genau angeben
    task_priority: string;
    // assignedTo: Profile[] | null;
    // task_category: 'User Story' | 'Technical Task';
    task_category: string;

    // subtask interface
    // orderIndex
    // subtasks: null;
    // status category
    task_status: string;
    order_index: number;
}

export interface TaskChanges {
    task_title: string;
    task_description: string | null;
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
