import { inject, Service, signal } from '@angular/core';
import { DatabaseService } from './database-service';

export interface TaskMember {
    taskId: number;
    memberId: string;
}
@Service()
export class TaskMembers {
    //#region properties
    private readonly database = inject(DatabaseService);
    taskMembers = signal<Record<number, string[]>>({});
    //#endregion

    constructor() {}

    //#region methods
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

    // set signal with arrays of member id's assigned to task id's
    async setTaskMembers(taskId: number) {
        const memberIds = await this.loadTaskProfileIds(taskId);
        this.updateTaskMembers(taskId, memberIds);
    }

    // set members for one task
    updateTaskMembers(taskId: number, taskmembers: string[]) {
        this.taskMembers.update((members) => ({
            ...members,
            [taskId]: taskmembers,
        }));
    }

    findNewTaskMembers(newMemberArr: string[], taskId: number) {
        // aktuell im signal
        const oldMembers: string[] = this.taskMembers()[taskId];
        // members die noch nicht im signal sind
        const newMembers: string[] = [];

        // find new members
        // undefined = new member (not in current signal)
        for (const newMember of newMemberArr) {
            const oldMember = oldMembers.find((oldMember) => oldMember === newMember);
            if (!oldMember) {
                newMembers.push(newMember);
            }
        }
        return newMembers;
    }

    findDeletedTaskMembers(newMemberArr: string[], taskId: number) { 
        // aktuell im signal
        const oldMembers: string[] = this.taskMembers()[taskId];
        // members die im arr übrig bleiben (im signal vorhanden, nach edit nicht)
        const deletedMembers: string[] = [];

        // find deleted members (only in current signal)
        // undefined = deleted
        for (const oldMember of oldMembers) {
            const newMember = newMemberArr.find((newMember) => newMember === oldMember);
            if (!newMember) {
                deletedMembers.push(oldMember);
            }
        }
        return deletedMembers;
    }
    //#endregion
}
