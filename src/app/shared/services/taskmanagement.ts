import { Injectable, inject, signal, computed, Signal } from '@angular/core';
import { DatabaseService } from './database-service';
import { StatusChange, Subtask, Task, TaskChanges } from '../interfaces/task';
import { TaskModel } from '../models/task-model';
import { RealtimeChannel } from '@supabase/supabase-js';
import { TaskMembers } from './task-members';
import { Subtaskmanagement } from './subtaskmanagement';

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
    taskDeleteChannel: RealtimeChannel | undefined;
    taskMemberInsertChannel: RealtimeChannel | undefined;
    //#endregion

    taskMembers = inject(TaskMembers);
    subtaskService = inject(Subtaskmanagement);

    tasksRequested = false;
    private tasksRequest: Promise<void> | null = null;
    readonly tasksLoading = signal(false);
    readonly tasksError = signal('');

    tasks = signal<Task[]>([]);
    currentTaskId = signal<number | null>(null);
    currentTask: Signal<Task | null> = computed(
        () => this.tasks().find((task) => task.TASK_ID === this.currentTaskId()) ?? null,
    );
    taskFormMode = signal<'edit' | 'add' | null>('add');
    scrollToNewTask = signal<string | null>(null);

    //#region taskstatus computed
    todo = computed(() =>
        [...this.filteredTasks()]
            .filter((t) => t.task_status === 'To do')
            .sort((a, b) => a.order_index - b.order_index),
    );
    progress = computed(() =>
        [...this.filteredTasks()]
            .filter((t) => t.task_status === 'In progress')
            .sort((a, b) => a.order_index - b.order_index),
    );
    feedback = computed(() =>
        [...this.filteredTasks()]
            .filter((t) => t.task_status === 'Await feedback')
            .sort((a, b) => a.order_index - b.order_index),
    );
    done = computed(() =>
        [...this.filteredTasks()]
            .filter((t) => t.task_status === 'Done')
            .sort((a, b) => a.order_index - b.order_index),
    );
    //#endregion
    //#endregion

    constructor() {
        this.subscribeInsert();
        this.subscribeUpdate();
        this.subscribeDelete();
    }

    ngOnDestroy() {
        this.unsubscribeInsert();
        this.unsubscribeUpdate();
        this.unsubscribeDelete();
    }

    //#region methods

    //#region subscribe task
    subscribeInsert() {
        this.taskInsertChannel = this.database.client
            .channel('custom-insert-channel')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'tasks' },
                (payload) => {
                    let tmpTask = new TaskModel(payload.new);
                    this.tasks.update((list) => [...list, tmpTask]);
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

    subscribeDelete() {
        this.taskDeleteChannel = this.database.client
            .channel('custom-delete-channel')
            .on(
                'postgres_changes',
                { event: 'DELETE', schema: 'public', table: 'tasks' },
                (payload) => {
                    this.tasks.update((tasks) =>
                        tasks.filter((task) => task.TASK_ID !== payload.old['TASK_ID']),
                    );
                },
            )
            .subscribe();
    }
    //#endregion

    //#region unsubscribe task
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

    unsubscribeDelete() {
        if (this.taskDeleteChannel) {
            this.database.client.removeChannel(this.taskDeleteChannel);
        }
    }
    //#endregion

    //#region add
    async addTaskDB(changes: TaskChanges, members: string[], subtasks: Subtask[]): Promise<Task> {
        const { data: task, error } = await this.database.client
            .from('tasks')
            .insert({ ...changes })
            .select(TASK_COLUMNS)
            .single();

        if (error) {
            console.error('The task could not be created:', error);
            throw error;
        }

        this.scrollToNewTask.set(task.TASK_ID);

        if (members.length > 0) {
            this.taskMembers.updateTaskMembers(task.TASK_ID, members);
            this.insertTaskMembers(members, task.TASK_ID);
        }

        if (subtasks.length > 0) {
            this.subtaskService.addSubtasks(subtasks, task.TASK_ID);
        }
        return task as Task;
    }

    // nach erstellung von task (wenn task id verfügbar)
    // prüfung ob members zu task hunzugefügt
    // arr mit objekten (task id + user id) wird erstellt und in datenbanktabelle geschrieben
    async insertTaskMembers(members: string[], taskId: number) {
        const assignments: { task_id: number; user_id: string }[] = members.map((memberId) => ({
            task_id: taskId,
            user_id: memberId,
        }));

        const { error: assignmentError } = await this.database.client
            .from('tasks_profiles')
            .insert(assignments);

        if (assignmentError) {
            console.error('The users could not be assigned to the task:', assignmentError);
            throw assignmentError;
        }
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
            await this.subtaskService.loadAllSubtasks();

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

    //#region delete task
    async deleteTask(taskId: number): Promise<void> {
        // Remove the deleted task from the board signal...
        this.tasks.update((tasks) => tasks.filter((task) => task.TASK_ID !== taskId));

        const { error } = await this.database.client.from('tasks').delete().eq('TASK_ID', taskId);

        if (error) {
            console.error('The task could not be deleted:', error);
            throw error;
        }
    }

    async deleteTaskMembers(memberId: string, taskId: number) {
        const { error: assignmentError } = await this.database.client
            .from('tasks_profiles')
            .delete()
            .eq('user_id', memberId)
            .eq('task_id', taskId);

        if (assignmentError) {
            console.error('The assigned user could not be deleted from the task:', assignmentError);
            throw assignmentError;
        }
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

        // Stop when Supabase cannot update the task.
        if (error) {
            console.error('The task could not be updated:', error);
            throw error;
        }
        // Return the updated task.
        return data as Task;
    }

    // updates task() signal after edit
    editTask(editedTask: Task) {
        this.tasks.update((tasks) =>
            tasks.map((task) =>
                task.TASK_ID === editedTask.TASK_ID ? new TaskModel(editedTask) : task,
            ),
        );
    }

    async updateStatus(taskId: number, changes: StatusChange): Promise<Task> {
        const { data, error } = await this.database.client
            .from('tasks')
            .update(changes)
            .eq('TASK_ID', taskId)
            .select(STATUS_COLUMNS)
            .single();

        // Stop when Supabase cannot update the status.
        if (error) {
            console.error('The status could not be updated:', error);
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
    //#endregion

    //#region searchbar
    // Contains the text entered into the search field on the board
    readonly searchTerm = signal('');
    // True while a search filter is active.
    readonly isSearchActive = computed(() => this.searchTerm().trim().length >= 3);

    // Show all tasks until at least three characters were entered
    // After that, title and description are searched through
    readonly filteredTasks = computed(() => {
        const searchText = this.searchTerm().trim().toLowerCase();

        if (searchText.length < 3) {
            return this.tasks();
        }

        return this.tasks().filter((task) => {
            const title = task.task_title?.toLowerCase() ?? '';
            const description = task.task_description?.toLowerCase() ?? '';

            return title.includes(searchText) || description.includes(searchText);
        });
    });
    //#endregion

    //#region deadlines
    private readonly PRIORITY_ORDER: Task['task_priority'][] = ['urgent', 'medium', 'low'];

    //next due date from tasks
    nextDeadlineDate = computed(() => {
        const upcoming = this.tasks()
            .filter((t) => t.task_status !== 'Done')
            .filter((t) => t.task_due_date)
            .map((t) => t.task_due_date)
            .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

        return upcoming[0] ?? null;
    });

    // all due tasks on that date
    tasksOnNextDeadline = computed(() => {
        const date = this.nextDeadlineDate();
        if (!date) return [];
        return this.tasks().filter((t) => t.task_due_date === date && t.task_status !== 'Done');
    });

    //highest prio present in those task
    highestPriorityOnDeadline = computed(() => {
        const tasksOnDate = this.tasksOnNextDeadline();
        return (
            this.PRIORITY_ORDER.find((p) => tasksOnDate.some((t) => t.task_priority === p)) ?? null
        );
    });
    // honw many tasks have this prio
    highestPriorityCountOnDeadline = computed(
        () =>
            this.tasksOnNextDeadline().filter(
                (t) => t.task_priority === this.highestPriorityOnDeadline(),
            ).length,
    );
    //#endregion

    setCurrentTask(taskId: number | null) {
        this.currentTaskId.set(taskId);
    }
    //#endregion
}
