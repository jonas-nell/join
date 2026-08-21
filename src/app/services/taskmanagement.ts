import { Service, inject, signal } from '@angular/core';
import { DatabaseService } from '../shared/services/database-service';
import { Task, TaskChanges } from '../shared/interfaces/task';

const TASK_COLUMNS = `TASK_ID, task_title, task_description, task_due_date, task_priority, task_category`;

@Service()
export class Taskmanagement {
    private readonly database = inject(DatabaseService);
    tasks = signal<Task[]>([]);
    tasksRequested = false;
    private tasksRequest: Promise<void> | null = null;

    readonly tasksLoading = signal(false);
    readonly tasksError = signal('');

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

    private async loadTasks(): Promise<void> {
        this.tasksLoading.set(true);
        this.tasksError.set('');

        try {
            const { data, error } = await this.database.client.from('tasks').select(TASK_COLUMNS);
            // .order('user_name');

            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }

            this.tasks.set(data ?? []);
        } catch (error) {
            this.tasksError.set('The tasks could not be loaded');
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
}
