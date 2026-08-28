import { Task, TaskChanges } from '../interfaces/task';
import { Subtask } from '../interfaces/task';

export class TaskModel implements Task {
    TASK_ID: number;
    task_title: string;
    task_description: string;
    task_due_date: string;
    task_priority: string;
    task_category: string;
    task_status: string;
    order_index: number;
    task_id?: number;
    subtasks: Subtask[] | [];

    constructor(data: Partial<Task> = {}, _order_index?: number) {
        this.TASK_ID = data.TASK_ID ?? 0;
        this.task_title = data.task_title ?? '';
        this.task_description = data.task_description ?? '';
        this.task_due_date = data.task_due_date ?? '';
        this.task_priority = data.task_priority ?? 'medium';
        this.task_category = data.task_category ?? '';
        this.task_status = data.task_status ?? 'To do';
        this.order_index = _order_index ?? data.order_index ?? 0;
        this.subtasks = data.subtasks ?? [];
    }
}
