import { Injectable, Service, inject, signal, computed } from '@angular/core';
import { DatabaseService } from './database-service';
import { StatusChange, Task, TaskChanges } from '../interfaces/task';

const TASK_COLUMNS = `TASK_ID, task_title, task_description, task_due_date, task_priority, task_category, task_status, order_index`;
const STATUS_COLUMNS = `task_status`;

@Injectable({
    providedIn: 'root',
})
export class Taskmanagement {
    private readonly database = inject(DatabaseService);
    tasks = signal<Task[]>([]);
    tasksRequested = false;
    private tasksRequest: Promise<void> | null = null;

    readonly tasksLoading = signal(false);
    readonly tasksError = signal('');

    todo = computed(
        () => [...this.tasks()].filter((t) => t.task_status === 'To do'),
        // .sort((a, b) => a.order_index - b.order_index),
    );
    progress = computed(
        () => [...this.tasks()].filter((t) => t.task_status === 'In progress'),
        // .sort((a, b) => a.order_index - b.order_index),
    );
    feedback = computed(
        () => [...this.tasks()].filter((t) => t.task_status === 'Await feedback'),
        // .sort((a, b) => a.order_index - b.order_index),
    );
    done = computed(
        () => [...this.tasks()].filter((t) => t.task_status === 'Done'),
        // .sort((a, b) => a.order_index - b.order_index),
    );

    async createTask(changes: TaskChanges): Promise<Task> {
        const { data, error } = await this.database.client
            .from('tasks')
            .insert({ ...changes })
            .select(TASK_COLUMNS)
            .single();

        if (error) {
            console.error('The task could not be created:', error);

            throw error;
        }

        this.notifyTasksChanged();

        return data as Task;
    }

    async loadTasks(): Promise<void> {
        this.tasksLoading.set(true);
        this.tasksError.set('');

        try {
            const { data, error } = await this.database.client
                .from('tasks')
                .select(TASK_COLUMNS)
                .order('order_index', { ascending: true });

            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }

            this.tasks.set(data ?? []);
            this.tasksRequested = true; //prevent loading issues
        } catch (error) {
            this.tasksError.set('The tasks could not be loaded');
            this.tasksRequested = false; //allow retry on failure
        } finally {
            this.tasksLoading.set(false);
            this.tasksRequest = null;
        }
    }

    async ensureTasksLoaded(forceReload = false): Promise<void> {
        if (!forceReload && this.tasksRequested) {
            if (this.tasksRequest) {
                await this.tasksRequest;
            }

            return;
        }

        this.tasksRequested = true;
        this.tasksRequest = this.loadTasks();

        await this.tasksRequest;
    }
    // Tell the tasks that its data has changed.
    private notifyTasksChanged(): void {
        void this.ensureTasksLoaded(true);
    }

    async updateTask(taskId: number, changes: TaskChanges): Promise<Task> {
        const { data, error } = await this.database.client
            .from('tasks')
            .update(changes)
            .eq('TASK_ID', taskId)
            .select(TASK_COLUMNS)
            .single();

        // Stop when Supabase cannot update the profile.
        if (error) {
            console.error('The profile could not be updated:', error);

            throw error;
        }

        // Reload the list so it displays the updated values.
        this.notifyTasksChanged();

        // Return the updated profile.
        return data as Task;
    }

    async updateStatus(taskId: number, changes: StatusChange): Promise<Task> {
        const { data, error } = await this.database.client
            .from('tasks')
            .update(changes)
            .eq('TASK_ID', taskId)
            .select(STATUS_COLUMNS)
            .single();

        // Stop when Supabase cannot update the profile.
        if (error) {
            console.error('The profile could not be updated:', error);

            throw error;
        }

        // Reload the list so it displays the updated values.
        this.notifyTasksChanged();

        // Return the updated profile.
        return data as Task;
    }

    async updateOrderIndices(updates: { TASK_ID: number; order_index: number }[]): Promise<void> {
        const results = await Promise.all(
            updates.map(({ TASK_ID, order_index }) =>
                this.database.client.from('tasks').update({ order_index }).eq('TASK_ID', TASK_ID),
            ),
        );

        const failed = results.find((r) => r.error);
        if(failed?.error) {
            console.error('could not be updated:', failed.error);
            throw failed.error;
        }
        this.notifyTasksChanged();
    }
}
