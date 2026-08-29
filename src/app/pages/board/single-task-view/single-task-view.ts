import { Component, OnInit, inject, input, output, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Taskmanagement } from '../../../shared/services/taskmanagement';
import { Profile } from '../../../shared/interfaces/profile';
import { Subtask, Task } from '../../../shared/interfaces/task';
import { UserBadge } from '../../../shared/components/user-badge/user-badge';
import { ProfileService } from '../../../shared/services/profile-service';
import { CategoryBadge } from '../../../shared/category-badge/category-badge';
import { NotificationService } from '../../../shared/services/notification-service';
import { ConfirmationService } from '../../../shared/services/confirmation-service';
import { DialogService } from '../../../shared/services/dialog-service';
import { Dialog } from '../../../shared/directives/dialog-directive';
import { ConfirmationDialog } from "../../../shared/components/confirmation/confirmation/confirmation";

@Component({
    selector: 'app-single-task-view',
    imports: [DatePipe, UserBadge, CategoryBadge, Dialog, ConfirmationDialog],
    templateUrl: './single-task-view.html',
    styleUrl: './single-task-view.scss',
})
export class SingleTaskView implements OnInit {
    readonly taskmanagement = inject(Taskmanagement);
    readonly profileService = inject(ProfileService);
    readonly dialogService = inject(DialogService);
    private readonly confirmationService = inject(ConfirmationService);
    private readonly notificationService = inject(NotificationService);

    // Loading signal to show dialog after loading all data
    // readonly loading = signal(true);

    // Prevent multiple delete clicks
    readonly deleting = signal(false);
    readonly errorMessage = signal('');

    async ngOnInit(): Promise<void> {}
    // async loadDialogData(): Promise<void> {
    //     this.loading.set(true);

    //     try {
    //         await this.profileService.ensureProfilesLoaded();

    //         const [profileIds] = await Promise.all([
    //             this.taskmanagement.loadTaskProfileIds(this.task().TASK_ID),
    //         ]);

    //         const profiles = profileIds
    //             .map((id) => this.profileService.getCachedProfileById(id))
    //             .filter((profile): profile is Profile => profile !== undefined);

    //         this.profiles.set(profiles);
    //     } catch {
    //         this.errorMessage.set('The task details could not be loaded.');
    //     } finally {
    //         this.loading.set(false);
    //     }
    //     console.log(this.loading());
    // }

    async changeSubtask(subtask: Subtask, event: Event): Promise<void> {
        const checkbox = event.target as HTMLInputElement;
        const previousValue = subtask.subtask_done;
        const newValue = checkbox.checked;

        if (subtask.id) {
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
    }

    private setLocalSubtaskValue(subtaskId: number, taskDone: boolean): void {
        this.taskmanagement.currentTask.update((task) => {
            if (!task || !task.subtasks) {
                return task;
            }

            return {
                ...task,
                subtasks: task.subtasks.map((subtask) =>
                    subtask.id === subtaskId ? { ...subtask, subtask_done: taskDone } : subtask,
                ),
            };
        });
    }

    closeDialog(): void {
        this.dialogService.closeDialog();
        this.taskmanagement.currentTask.set(null);
    }

    async deleteTask(): Promise<void> {
        const confirmed = await this.confirmationService.confirm(
            'Do you really want to delete this task?',
        );

        if (!confirmed) {
            return;
        }

        try {
            const currentTask = this.taskmanagement.currentTask();

            if (currentTask != null) {
                await this.taskmanagement.deleteTask(currentTask.TASK_ID);
            }
            this.notificationService.success('Task deleted.');
            this.dialogService.closeDialog();
        } catch {
            this.notificationService.error('The task could not be deleted.');
        }
    }
}
