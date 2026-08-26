import { Injectable, Service, inject, signal, computed } from '@angular/core';
import { DatabaseService } from './database-service';
import { StatusChange, Subtask, Task, TaskChanges } from '../interfaces/task';
import { Profile } from '../interfaces/profile';
import { TaskModel } from '../models/task-model';

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
    taskInsertChannel;

    readonly tasksLoading = signal(false);
    readonly tasksError = signal('');

    todo = computed(() => [...this.tasks()].filter((t) => t.task_status === 'To do'));
    progress = computed(() => [...this.tasks()].filter((t) => t.task_status === 'In progress'));
    feedback = computed(() => [...this.tasks()].filter((t) => t.task_status === 'Await feedback'));
    done = computed(() => [...this.tasks()].filter((t) => t.task_status === 'Done'));

    constructor() {
        this.taskInsertChannel = this.database.client
            .channel('custom-insert-channel')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'tasks' },
                (payload) => {
                    let tmpTask = new TaskModel(payload.new);
                    this.tasks.update((list) => [...list, tmpTask]);
                    console.log('Change received!', payload);
                },
            )
            .subscribe();
    }

    async addTaskDB(changes: TaskChanges, members: Profile[], subtasks: string[]): Promise<Task> {
        const { data: task, error } = await this.database.client
            .from('tasks')
            .insert({ ...changes })
            .select(TASK_COLUMNS)
            .single();

        if (error) {
            console.error('The task could not be created:', error);

            throw error;
        }

        if (members.length > 0) {
            this.filterTaskMembers(members, task.TASK_ID);
        }

        if (subtasks.length > 0) {
            this.addSubtasks(subtasks, task.TASK_ID);
        }

        // this.notifyTasksChanged();
        console.log(changes);

        return task as Task;
    }

    // verhindern, dass ein title mehrfach vergeben werden kann
    isDoubleTask(taskTitle: string) {
        const doubleTask = this.tasks().some((task) => task.task_title === taskTitle);
        console.log(doubleTask);
        return doubleTask;
    }

    async addSubtasks(subtasks: string[], taskId: number) {
        const subtaskArr: Subtask[] = subtasks.map((subtask) => ({
            id: 0,
            task_id: taskId,
            subtask_title: subtask,
            subtask_done: false,
        }));

        const { error: assignmentError } = await this.database.client
            .from('subtasks')
            .insert(subtaskArr);

        if (assignmentError) {
            console.error('The subtasks could not be assigned to the task:', assignmentError);
            throw assignmentError;
        }
    }

    // nach erstellung von task (wenn task id verfügbar)
    // prüfung ob members zu task hunzugefügt
    // arr mit objekten (task id + user id) wird erstellt und in datenbanktabelle geschrieben
    async filterTaskMembers(members: Profile[], taskId: number) {
        const assignments: { task_id: number; user_id: string }[] = members.map((member) => ({
            task_id: taskId,
            user_id: member.id,
        }));

        const { error: assignmentError } = await this.database.client
            .from('tasks_profiles')
            .insert(assignments);

        if (assignmentError) {
            console.error('The users could not be assigned to the task:', assignmentError);
            throw assignmentError;
        }
        console.log(assignments);
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

    // Get profile IDs assigned to the task
    async loadTaskProfileIds(taskId: number): Promise<string[]> {
        const { data, error } = await this.database.client
            .from('tasks_profiles')
            .select('user_id')
            .eq('task_id', taskId);

        if (error) {
            console.error('The assignments could not be loaded:', error);
            throw error;
        }

        return (data ?? []).map((assignment) => assignment.user_id);
    }

    // Get subtasks assigned to the task
    async loadSubtasks(taskId: number): Promise<Subtask[]> {
        const { data, error } = await this.database.client
            .from('subtasks')
            .select('*')
            .eq('task_id', taskId)
            .order('id');

        if (error) {
            console.error('The subtasks could not be loaded:', error);
            throw error;
        }

        return data ?? [];
    }

    async updateSubtaskDone(subtaskId: number, subtaskDone: boolean): Promise<void> {
        const { error } = await this.database.client
            .from('subtasks')
            .update({ subtask_done: subtaskDone })
            .eq('id', subtaskId);

        if (error) {
            console.error('The subtask could not be updated:', error);
            throw error;
        }
    }

    async deleteTask(taskId: number): Promise<void> {
        const { error } = await this.database.client.from('tasks').delete().eq('TASK_ID', taskId);

        if (error) {
            console.error('The task could not be deleted:', error);
            throw error;
        }

        // Remove the deleted task from the board signal...
        this.tasks.update((tasks) => tasks.filter((task) => task.TASK_ID !== taskId));
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
    // private notifyTasksChanged(): void {
    //     void this.ensureTasksLoaded(true);
    // }

    async updateTask(taskId: number, changes: TaskChanges): Promise<Task> {
        const { data, error } = await this.database.client
            .from('tasks')
            .update(changes)
            .eq('TASK_ID', taskId)
            .select(TASK_COLUMNS)
            .single();

        // Stop when Supabase cannot update the profile.
        if (error) {
            console.error('The task could not be updated:', error);

            throw error;
        }

        // Reload the list so it displays the updated values.
        // this.notifyTasksChanged();
        //
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
        // this.notifyTasksChanged();

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
        if (failed?.error) {
            console.error('could not be updated:', failed.error);
            throw failed.error;
        }
        // this.notifyTasksChanged();
    }
}

// function checkDoubleTask(task_title: string) {
//     throw new Error('Function not implemented.');
// }
