import { Injectable, Service, inject, signal } from '@angular/core';
import { DatabaseService } from './database-service';
import { StatusChange, Task, TaskChanges } from '../interfaces/task';

const TASK_COLUMNS = `TASK_ID, task_title, task_description, task_due_date, task_priority, task_category, task_status`;
const STATUS_COLUMNS = `task_status`;

@Injectable({
    providedIn:'root'
})
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

    async loadTasks(): Promise<void> {
        this.tasksLoading.set(true);
        this.tasksError.set('');

        try {
            const { data: sessionData } = await this.database.client.auth.getSession();
            console.log('session AFTER await:', sessionData.session);
            const { data, error } = await this.database.client.from('tasks').select(TASK_COLUMNS);            
            console.log('query result:', data, 'error:', error);
            // .order('user_name');

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
                .eq('id', taskId)
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
}
