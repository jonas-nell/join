import { Component, computed, inject, input, signal } from '@angular/core';
import { CdkDrag, CdkDragPlaceholder } from '@angular/cdk/drag-drop';

import { Subtask, Task } from '../../../shared/interfaces/task';
import { CategoryBadge } from '../../../shared/category-badge/category-badge';
import { Taskmanagement } from '../../../shared/services/taskmanagement';
import { ProfileService } from '../../../shared/services/profile-service';
import { Profile } from '../../../shared/interfaces/profile';
import { UserBadge } from '../../../shared/components/user-badge/user-badge';
import { DialogName, DialogService } from '../../../shared/services/dialog-service';
import { Dialog } from "../../../shared/directives/dialog-directive";

const MAX_VISIBLE_PROFILES = 3;

@Component({
    selector: 'app-task-card',
    imports: [CdkDrag, CdkDragPlaceholder, CategoryBadge, UserBadge, Dialog],
    templateUrl: './task-card.html',
    styleUrl: './task-card.scss',
})
export class TaskCard {
    readonly taskmanagement = inject(Taskmanagement);
    readonly profileServicce = inject(ProfileService);
    readonly dialogService = inject(DialogService);
    task = input.required<Task>();

    readonly totalSubtasks = computed(() => this.task().subtasks?.length ?? 0);
    readonly doneSubtasks = computed(
        () => this.task().subtasks?.filter((subtask) => subtask.subtask_done).length ?? 0);
    readonly progressPercent = computed(() =>
        this.totalSubtasks() === 0 ? 0 : (this.doneSubtasks() / this.totalSubtasks()) * 100);

    private readonly priorityIcons: Record<string, string> = {
        low: './assets/icons/Prio low.png',
        medium: './assets/icons/Prio medium.png',
        urgent: './assets/icons/Prio urgent.png',
    };
    readonly priorityIcon = computed(
        () => this.priorityIcons[this.task().task_priority] ?? this.priorityIcons['medium'],
    );

    // #region ###### umschreiben #######

    // readonly profiles = signal<Profile[]>([]);
    // readonly visibleProfiles = computed(() => this.profiles().slice(0, MAX_VISIBLE_PROFILES));
    // readonly hiddenProfilesCount = computed(() =>
    //     Math.max(0, this.profiles().length - MAX_VISIBLE_PROFILES),
    // );

    // );
    //#endregion

    taskOpen = signal(false);

    readonly statusOptions: {value: Task['task_status']; label: string }[] = [
        { value: 'To do', label: 'To do' },
        { value: 'In progress', label: 'In progress'},
        { value: 'Await feedback', label: 'Await feedback'},
        { value: 'Done', label: 'Done'}
    ];

    readonly otherStatuses = computed(() => this.statusOptions.filter((s) => s.value !== this.task().task_status));

    readonly moveMenuName = computed<DialogName>(() => `move-menu-${this.task().TASK_ID}`);
    openMoveMenu(event: MouseEvent): void {
        event.stopPropagation();
        this.dialogService.openDialog(this.moveMenuName());
    }

    async moveTo(newStatus: Task['task_status']): Promise<void> {
        this.dialogService.closeDialog();
        await this.taskmanagement.moveTaskToStatus(this.task(), newStatus);
    }

    // async ngOnInit(): Promise<void> {
    //     await this.profileServicce.ensureProfilesLoaded();

    //     const [profileIds, subtasks] = await Promise.all([
    //         this.taskmanagement.loadTaskProfileIds(this.task().TASK_ID),
    //         this.taskmanagement.loadSubtasks(this.task().TASK_ID),
    //     ]);

    //     const profiles = profileIds
    //         .map((id) => this.profileServicce.getCachedProfileById(id))
    //         .filter((profile): profile is Profile => profile !== undefined);

    //     this.profiles.set(profiles);
    //     this.subtasks.set(subtasks);
    // }

    openTask() {
        this.taskmanagement.setCurrentTask(this.task().TASK_ID);
        this.dialogService.openDialog('single-task');
    }

    closeTask(): void {
        this.dialogService.closeDialog();
        this.taskmanagement.setCurrentTask(null);
    }
}
