import { Injectable, inject, signal, computed, Signal } from '@angular/core';
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
    currentTaskId = signal<number | null>(null);
    currentTask: Signal<Task | null> = computed(
        () => this.tasks().find((task) => task.TASK_ID === this.currentTaskId()) ?? null,
    );
    // currentTask = signal<Task | null>(null);

    setCurrentTask(taskId: number | null) {
        this.currentTaskId.set(taskId);
    }

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
    unsubscribeInsert() {
        if (this.taskInsertChannel) {
            this.database.client.removeChannel(this.taskInsertChannel);
        }
    }

    unsubscribeUpdate() {
        if (this.taskUpdateChannel) {
            this.database.client.removeChannel(this.taskUpdateChannel);
        }
    }
    //#endregion

    //#endregion

    //#region add
    async addTaskDB(changes: TaskChanges, members: Profile[], subtasks: Subtask[]): Promise<Task> {
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

    async addSubtasks(subtasks: Subtask[], taskId: number) {
        // Omit: Use the Subtask interface but leave out the id...
        const subtaskArr: Omit<Subtask, 'id'>[] = subtasks.map((subtask) => ({
            task_id: taskId,
            subtask_title: subtask.subtask_title,
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
            await this.setSubtasks();
            console.log(this.tasks());

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

    // holt für jeden task die subtasks von der DB und speichert sie lokal im signal tasks
    async setSubtasks() {
        const tasksWithSubtasks = await Promise.all(
            this.tasks().map(async (task) => ({
                ...task,
                subtasks: await this.loadSubtasks(task.TASK_ID),
            })),
        );
        this.tasks.set(tasksWithSubtasks);
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

    async moveTaskToStatus(task: Task, newStatus: StatusChange['task_status']): Promise<void> {
        if (task.task_status === newStatus) return;

        const targetTasks = this.tasks().filter(
            (t) => t.task_status === newStatus && t.TASK_ID !== task.TASK_ID,
        );
        const updates = [...targetTasks, task].map((t, index) => ({
            TASK_ID: t.TASK_ID,
            order_index: index,
        }));

        this.reorderLocally(task.TASK_ID, newStatus, updates);
        await this.updateStatus(task.TASK_ID, { task_status: newStatus });
        await this.updateOrderIndices(updates);
    }
}
