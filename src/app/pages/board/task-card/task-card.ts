import { Component, input, signal } from '@angular/core';
import { CdkDrag, CdkDragPlaceholder } from '@angular/cdk/drag-drop';

import { Task } from '../../../shared/interfaces/task';
import { CategoryBadge } from '../../../shared/category-badge/category-badge';
import { SingleTaskView } from '../single-task-view/single-task-view';

@Component({
    selector: 'app-task-card',
    imports: [CdkDrag, CdkDragPlaceholder, CategoryBadge, SingleTaskView],
    templateUrl: './task-card.html',
    styleUrl: './task-card.scss',
})
export class TaskCard {
    task = input.required<Task>();
    taskOpen = signal(false);

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
