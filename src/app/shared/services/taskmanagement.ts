import { Injectable, Service, inject, signal, computed } from '@angular/core';
import { DatabaseService } from './database-service';
import { StatusChange, Subtask, Task, TaskChanges } from '../interfaces/task';
import { Profile } from '../interfaces/profile';
import { TaskModel } from '../models/task-model';
import { RealtimeChannel } from '@supabase/supabase-js';

const TASK_COLUMNS = `TASK_ID, task_title, task_description, task_due_date, task_priority, task_category, task_status, order_index`;
const STATUS_COLUMNS = `task_status`;

@Injectable({
    providedIn: 'root',
})
export class Taskmanagement {
    //#region properties

    //#region properties DB
    private readonly database = inject(DatabaseService);
    taskInsertChannel: RealtimeChannel | undefined;
    taskUpdateChannel: RealtimeChannel | undefined;
    //#endregion

    tasksRequested = false;
    private tasksRequest: Promise<void> | null = null;
    readonly tasksLoading = signal(false);
    readonly tasksError = signal('');

    tasks = signal<Task[]>([]);

    //#region taskstatus computed
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
    //#endregion
    //#endregion

    constructor() {
        this.subscribeInsert();
        this.subscribeUpdate();
    }

    ngOnDestroy() {
        console.log('unsubscribe works');
        this.unsubscribeInsert();
        this.unsubscribeUpdate();
    }
    
    //#region methods

    //#region realtime

    //#region subscribe
    subscribeInsert() {
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

    subscribeUpdate() {
        this.taskUpdateChannel = this.database.client
            .channel('custom-update-channel')
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'tasks' },
                (payload) => {
                    this.tasks.update((tasks) =>
                        tasks.map((task) =>
                            task.TASK_ID === payload.new['TASK_ID']
                                ? new TaskModel(payload.new)
                                : task,
                        ),
                    );
                },
            )
            .subscribe();
    }
    //#endregion

    //#region unsubscribe
    unsubscribeInsert(){
        if (this.taskInsertChannel) {
            this.database.client.removeChannel(this.taskInsertChannel)
        }
    }

    unsubscribeUpdate(){
        if (this.taskUpdateChannel) {
            this.database.client.removeChannel(this.taskUpdateChannel)
        }
    }
    //#endregion

    //#endregion

    //#region add
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
            task_id: taskId,
            subtask_title: subtask,
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
    //#endregion

    //#region load
    async loadTasks(): Promise<void> {
        this.tasksLoading.set(true);
        this.tasksError.set('');

        try {
            const { data, error } = await this.database.client.from('tasks').select(TASK_COLUMNS);

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
    //#endregion

    //#region update data
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

        // Return the updated profile.
        return data as Task;
    }

    async updateOrderIndices(updates: { TASK_ID: number; order_index: number }[]): Promise<void> {
        const { error } = await this.database.client.rpc('update_task_order', { updates });

        if (error) {
            console.error('Could not update task order:', error);
            throw error;
        }
    }

    //reordering the task signals (dragndrop), keeps arrays in sync, avoids flicker from realtime subscription vs drag
    reorderLocally(
        movedTaskId: number,
        newStatus: StatusChange['task_status'] | null,
        orderUpdates: { TASK_ID: number; order_index: number }[],
    ): void {
        const orderMap = new Map(orderUpdates.map((u) => [u.TASK_ID, u.order_index]));

        this.tasks.update((tasks) =>
            tasks.map((task) => {
                if (!orderMap.has(task.TASK_ID)) return task;
                const patched = { ...task, order_index: orderMap.get(task.TASK_ID) };
                if (newStatus && task.TASK_ID === movedTaskId) {
                    patched.task_status = newStatus;
                }
                return patched as Task;
            }),
        );
    }
        //#endregion
        //#endregion
}

