import { Component, OnInit, inject, input, output, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Taskmanagement } from '../../../shared/services/taskmanagement';
import { Profile } from '../../../shared/interfaces/profile';
import { Subtask, Task } from '../../../shared/interfaces/task';
import { UserBadge } from '../../../shared/components/user-badge/user-badge';
import { ProfileService } from '../../../shared/services/profile-service';

@Component({
    selector: 'app-single-task-view',
    imports: [DatePipe, UserBadge],
    templateUrl: './single-task-view.html',
    styleUrl: './single-task-view.scss',
})
export class SingleTaskView implements OnInit {
    private readonly taskmanagement = inject(Taskmanagement);
    private readonly profileService = inject(ProfileService);

    // Get task from parent component
    readonly task = input.required<Task>();

    // Removes the dialog when this event is emitted
    readonly closed = output<void>();

    // Open the edit overlay later...todo
    readonly editRequested = output<Task>();

    // Signals for profiles and subtasks
    readonly profiles = signal<Profile[]>([]);
    readonly subtasks = signal<Subtask[]>([]);

    // Prevent multiple delete clicks
    readonly deleting = signal(false);
    readonly errorMessage = signal('');

    async ngOnInit(): Promise<void> {
        await this.loadDialogData();
    }

    async loadDialogData(): Promise<void> {
    // Make sure the profile cache has been loaded.
    await this.profileService.ensureProfilesLoaded();

    const [profileIds, subtasks] = await Promise.all([
        this.taskmanagement.loadTaskProfileIds(this.task().TASK_ID),
        this.taskmanagement.loadSubtasks(this.task().TASK_ID),
    ]);

    const profiles = profileIds
        .map((id) => this.profileService.getCachedProfileById(id))
        .filter((profile): profile is Profile => profile !== undefined);

    this.profiles.set(profiles);
    this.subtasks.set(subtasks);
}

    async changeSubtask(subtask: Subtask, event: Event): Promise<void> {
        const checkbox = event.target as HTMLInputElement;
        const previousValue = subtask.subtask_done;
        const newValue = checkbox.checked;

        // Update the displayed checkbox immediately.
        this.setLocalSubtaskValue(subtask.id, newValue);

        try {
            await this.taskmanagement.updateSubtaskDone(subtask.id, newValue);
        } catch {
            // Restore the previous value when saving fails.
            this.setLocalSubtaskValue(subtask.id, previousValue);
            this.errorMessage.set('The subtask could not be saved.');
        }
    }

    private setLocalSubtaskValue(subtaskId: number, taskDone: boolean): void {
        this.subtasks.update((subtasks) =>
            subtasks.map((subtask) =>
                subtask.id === subtaskId ? { ...subtask, subtask_done: taskDone } : subtask,
            ),
        );
    }

    requestEdit(): void {
        this.editRequested.emit(this.task());
    }

    async deleteTask(): Promise<void> {
        if (this.deleting()) {
            return;
        }

        this.deleting.set(true);
        this.errorMessage.set('');

        try {
            await this.taskmanagement.deleteTask(this.task().TASK_ID);
            this.closed.emit();
        } catch {
            this.errorMessage.set('The task could not be deleted.');
        } finally {
            this.deleting.set(false);
        }
    }
}
