import { Component, computed, inject, input, signal } from '@angular/core';
import { CdkDrag, CdkDragPlaceholder } from '@angular/cdk/drag-drop';

import { Subtask, Task } from '../../../shared/interfaces/task';
import { CategoryBadge } from '../../../shared/category-badge/category-badge';
import { SingleTaskView } from '../single-task-view/single-task-view';
import { Taskmanagement } from '../../../shared/services/taskmanagement';
import { ProfileService } from '../../../shared/services/profile-service';
import { Profile } from '../../../shared/interfaces/profile';
import { UserBadge } from '../../../shared/components/user-badge/user-badge';

const MAX_VISIBLE_PROFILES = 3;

@Component({
    selector: 'app-task-card',
    imports: [CdkDrag, CdkDragPlaceholder, CategoryBadge, UserBadge, SingleTaskView],
    templateUrl: './task-card.html',
    styleUrl: './task-card.scss',
})
export class TaskCard {
    private readonly taskmanagement = inject(Taskmanagement);
    private readonly profileServicce = inject(ProfileService);
    task = input.required<Task>();

    readonly subtasks = signal<Subtask[]>([]);
    readonly totalSubtasks = computed(() => this.subtasks().length);
    readonly doneSubtasks = computed(() => this.subtasks().filter((subtask) => subtask.subtask_done).length,);
    readonly progressPercent = computed(() => this.totalSubtasks() === 0 ? 0 : (this.doneSubtasks() / this.totalSubtasks()) * 100);

    private readonly priorityIcons: Record<string, string> = {
        low: './assets/icons/Prio low.png',
        medium: './assets/icons/Prio medium.png',
        urgent: './assets/icons/Prio urgent.png',
    };
    readonly priorityIcon = computed( () => this.priorityIcons[this.task().task_priority] ?? this.priorityIcons['medium']);
    
    
    readonly profiles = signal<Profile[]>([]);
    readonly visibleProfiles = computed(() => this.profiles().slice(0, MAX_VISIBLE_PROFILES));
    readonly hiddenProfilesCount = computed(() => Math.max(0, this.profiles().length - MAX_VISIBLE_PROFILES));
    
    taskOpen = signal(false);
    
    async ngOnInit(): Promise<void> {
        await this.profileServicce.ensureProfilesLoaded();

        const [profileIds, subtasks] = await Promise.all([
            this.taskmanagement.loadTaskProfileIds(this.task().TASK_ID),
            this.taskmanagement.loadSubtasks(this.task().TASK_ID),
        ]);

        const profiles = profileIds.map((id) => this.profileServicce.getCachedProfileById(id)).filter((profile): profile is Profile => profile !== undefined);
        
        this.profiles.set(profiles);
        this.subtasks.set(subtasks);
        }

    openTask(): void {
        this.taskOpen.set(true);
    }

    closeTask(): void {
        this.taskOpen.set(false);
    }

    openEditTask(task: Task): void {
        this.taskOpen.set(false);

        // The edit dialog will be added later.
        console.log('Edit task:', task);
    }
}
