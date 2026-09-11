import { inject, Service, signal } from '@angular/core';
import { RealtimeChannel } from '@supabase/supabase-js';
import { Subtask } from '../interfaces/task';
import { DatabaseService } from './database-service';

@Service()
export class Subtaskmanagement {
    private readonly database = inject(DatabaseService);

    subtaskUpdateChannel: RealtimeChannel | undefined;
    subtaskInsertChannel: RealtimeChannel | undefined;
    subtaskDeleteChannel: RealtimeChannel | undefined;

    subtasks = signal<Record<number, Subtask[]>>({});

    constructor(){
        this.subscribeSubtaskUpdate();
        this.subscribeSubtaskInsert();
        this.subscribeSubtaskDelete();
    }

    ngOnDestroy() {
        this.unsubscrSubtaskInsert();
        this.unsubscrSubtaskUpdate();
        this.unsubscribeSubtaskDelete();
    }

     //#region subscribe subtask
    subscribeSubtaskUpdate() {
        this.subtaskUpdateChannel = this.database.client
            .channel('custom-subtask-update-channel')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'subtasks',
                },
                (payload) => {
                    const changes = payload.new as Subtask;
                    const taskId = changes.task_id;
                    if (taskId === undefined) {
                        return;
                    }

                    this.subtasks.update((subtasks) => ({
                        ...subtasks,
                        [taskId]: (subtasks[taskId] ?? []).map((subtask) =>
                            subtask.id === changes.id ? changes : subtask,
                        ),
                    }));
                },
            )
            .subscribe();
    }

    subscribeSubtaskInsert() {
        this.subtaskInsertChannel = this.database.client
            .channel('custom-subtask-insert-channel')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'subtasks' },
                (payload) => {
                    let tmpSubtask = payload.new as Subtask;
                    const taskId = tmpSubtask.task_id;
                    if (taskId === undefined) {
                        return;
                    }
                    this.subtasks.update((subtasks) => ({
                        ...subtasks,
                        [taskId]: [...(subtasks[taskId] ?? []), tmpSubtask],
                    }));
                },
            )
            .subscribe();
    }

    subscribeSubtaskDelete() {
        this.subtaskDeleteChannel = this.database.client
            .channel('custom-subtask-delete-channel')
            .on(
                'postgres_changes',
                { event: 'DELETE', schema: 'public', table: 'subtasks' },
                (payload) => {
                    let tmpSubtask = payload.old as Subtask;
                    const subtaskId = tmpSubtask.id;
                    if (subtaskId === undefined) {
                        return;
                    }
                    this.subtasks.update((subtasks) => {
                        const updated = { ...subtasks };

                        for (const taskId in updated) {
                            updated[Number(taskId)] = updated[Number(taskId)].filter(
                                (subtask) => subtask.id !== subtaskId,
                            );
                        }

                        return updated;
                    });
                },
            )
            .subscribe();
    }
    //#endregion

     //#region unsubscribe subtask
    unsubscrSubtaskInsert() {
        if (this.subtaskInsertChannel) {
            this.database.client.removeChannel(this.subtaskInsertChannel);
        }
    }

    unsubscrSubtaskUpdate() {
        if (this.subtaskUpdateChannel) {
            this.database.client.removeChannel(this.subtaskUpdateChannel);
        }
    }

    unsubscribeSubtaskDelete() {
        if (this.subtaskDeleteChannel) {
            this.database.client.removeChannel(this.subtaskDeleteChannel);
        }
    }
    //#endregion

    //#region db
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

    // loads all subtasks from db into subtasks() signal
    async loadAllSubtasks(): Promise<void> {
        const { data, error } = await this.database.client.from('subtasks').select('*').order('id');

        if (error) {
            console.error('The subtasks could not be loaded:', error);
            throw error;
        }

        const groupedSubtasks: Record<number, Subtask[]> = {};

        for (const subtask of data ?? []) {
            const taskId = subtask.task_id;

            if (!groupedSubtasks[taskId]) {
                groupedSubtasks[taskId] = [];
            }

            groupedSubtasks[taskId].push(subtask);
        }

        this.subtasks.set(groupedSubtasks);
    }

     // updated subtask in db
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

    async deleteSubTask(subtaskId: number): Promise<void> {
        const { error } = await this.database.client.from('subtasks').delete().eq('id', subtaskId);

        if (error) {
            console.error('The subtask could not be deleted:', error);
            throw error;
        }
    }
    //#endregion

    //#region local (signal)
     // updates subtasks() signal
    updateSubtasks(subtaskId: number, taskId: number, changes: Partial<Subtask>) {
        this.subtasks.update((subtasks) => ({
            ...subtasks,
            [taskId]: (subtasks[taskId] ?? []).map((subtask) =>
                subtask.id === subtaskId ? { ...subtask, ...changes } : subtask,
            ),
        }));
    }

    deleteSubtaskLocal(subtaskId: number, taskId: number) {
        this.subtasks.update((subtasks) => ({
            ...subtasks,
            [taskId]: (subtasks[taskId] ?? []).filter((subtask) => subtask.id !== subtaskId),
        }));
    }
    //#endregion
}
