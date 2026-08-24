import { Injectable, Service, Signal, computed, inject, signal } from '@angular/core';
import { DatabaseService } from './database-service';
import { StatusChange, Task, TaskChanges } from '../interfaces/task';

// order_index hinzufügen
const TASK_COLUMNS = `TASK_ID, task_title, task_description, task_due_date, task_priority, task_category, task_status, order_index`;
const STATUS_COLUMNS = `task_status`;

@Injectable({
    providedIn: 'root',
})
export class Taskmanagement {
    //#region properties
    private readonly database = inject(DatabaseService);

    tasks = signal<Task[]>([]);

    // todo = signal<Task[]>([]);
    // progress = signal<Task[]>([]);
    // feedback = signal<Task[]>([]);
    // done = signal<Task[]>([]);
    todo = computed(() =>
        [...this.tasks()]
            .filter((t) => t.task_status === 'To do')
            .sort((a, b) => a.order_index - b.order_index),
    );
    progress = computed(() =>
        [...this.tasks()]
            .filter((t) => t.task_status === 'In progress')
            .sort((a, b) => a.order_index - b.order_index),
    );
    feedback = computed(() =>
        [...this.tasks()]
            .filter((t) => t.task_status === 'Await feedback')
            .sort((a, b) => a.order_index - b.order_index),
    );
    done = computed(() =>
        [...this.tasks()]
            .filter((t) => t.task_status === 'Done')
            .sort((a, b) => a.order_index - b.order_index),
    );

    tasksRequested = false;
    private tasksRequest: Promise<void> | null = null;

    readonly tasksLoading = signal(false);
    readonly tasksError = signal('');
    //#endregion

    constructor() {
        void this.ensureTasksLoaded();
    }

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
        console.log(changes);

        return data as Task;
    }

    async loadTasks(): Promise<void> {
        this.tasksLoading.set(true);
        this.tasksError.set('');

        try {
            const { data: tasks, error } = await this.database.client
                .from('tasks')
                .select(TASK_COLUMNS);

            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }

            this.tasks.set(tasks ?? []);
            // this.sortTasks();
        } catch (error) {
            this.tasksError.set('The tasks could not be loaded');
        } finally {
            this.tasksLoading.set(false);
            this.tasksRequest = null;
        }
    }

    // sortTasks() {
    //     this.todo.set(this.tasks().filter((t) => t.task_status === 'To do'));
    //     this.progress.set(this.tasks().filter((t) => t.task_status === 'In progress'));
    //     this.feedback.set(this.tasks().filter((t) => t.task_status === 'Await feedback'));
    //     this.done.set(this.tasks().filter((t) => t.task_status === 'Done'));
    // }

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

    moveTaskWithinColumn(taskId: string, newPosition: number): void {
        this.tasks.update((tasks) => {
            const movedTask = tasks.find((task) => task.TASK_ID === taskId);

            if (!movedTask) {
                return tasks;
            }

            const status = movedTask.task_status;

            const column = tasks
                .filter((task) => task.task_status === status)
                .sort((a, b) => a.order_index - b.order_index);

            const oldPosition = column.findIndex((task) => task.TASK_ID === taskId);

            const [task] = column.splice(oldPosition, 1);

            column.splice(newPosition, 0, task);

            const updatedColumn = column.map((task, index) => ({
                ...task,
                order_index: index,
            }));

            return tasks.map((task) =>
                task.task_status === status
                    ? (updatedColumn.find((updated) => updated.TASK_ID === task.TASK_ID) ?? task)
                    : task,
            );
        });
    }

    moveTaskToColumn(taskId: string, newStatus: Task['task_status'], newPosition: number): void {
        this.tasks.update((tasks) => {
            const movedTask = tasks.find((task) => task.TASK_ID === taskId);

            if (!movedTask) {
                return tasks;
            }

            const oldStatus = movedTask.task_status;

            const oldColumn = tasks
                .filter((task) => task.task_status === oldStatus)
                .sort((a, b) => a.order_index - b.order_index);

            const newColumn = tasks
                .filter((task) => task.task_status === newStatus)
                .sort((a, b) => a.order_index - b.order_index);

            // aus alter spalte entfernen
            oldColumn.splice(
                oldColumn.findIndex((task) => task.TASK_ID === taskId),
                1,
            );

            // in neue spalte einfügen
            newColumn.splice(newPosition, 0, {
                ...movedTask,
                task_status: newStatus,
            });

            // positionen alte spalte aktualisieren
            const updatedOldColumn = oldColumn.map((task, index) => ({
                ...task,
                order_index: index,
            }));

            // positionen neue spalte aktualisieren
            const updatedNewColumn = newColumn.map((task, index) => ({
                ...task,
                order_index: index,
            }));

            // beide spalten in task-array übernehmen
            return tasks.map((task) => {
                const updatedTask = [...updatedOldColumn, ...updatedNewColumn].find(
                    (updated) => updated.TASK_ID === task.TASK_ID,
                );

                return updatedTask ?? task;
            });
        });
    }
}
