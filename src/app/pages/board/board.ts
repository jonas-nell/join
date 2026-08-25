import { Component, effect, inject, computed } from '@angular/core';
import { SearchBar } from './search-bar/search-bar/search-bar';
import { AddTaskButton } from '../../shared/components/add-task-button/add-task-button';
import {
    CdkDrag,
    CdkDragDrop,
    CdkDropList,
    moveItemInArray,
    transferArrayItem,
    CdkDropListGroup,
    CdkDragPlaceholder,
} from '@angular/cdk/drag-drop';
import { Task } from '../../shared/interfaces/task';
import { Taskmanagement } from '../../shared/services/taskmanagement';
import { StatusChange } from '../../shared/interfaces/task';
import { TaskCard } from './task-card/task-card';


@Component({
    selector: 'app-board',
    imports: [AddTaskButton, SearchBar, CdkDropList, CdkDropListGroup, TaskCard],
    templateUrl: './board.html',
    styleUrl: './board.scss',
})
export class Board {
    readonly taskmanagementService = inject(Taskmanagement);
    
    constructor() {
        this.taskmanagementService.ensureTasksLoaded();
    }

    async drop(event: CdkDragDrop<Task[]>) {
        const task = event.previousContainer.data[event.previousIndex];

        if (event.previousContainer === event.container) {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
            const updates = this.calculateNewOrderIndices(event.container.data);
            await this.taskmanagementService.updateOrderIndices(updates);
            return;
        }

        transferArrayItem(
            event.previousContainer.data,
            event.container.data,
            event.previousIndex,
            event.currentIndex,
        );

        const status = this.getStatusFromContainer(event.container.id);
        const sourceUpdates = this.calculateNewOrderIndices(event.previousContainer.data);
        const destUpdates = this.calculateNewOrderIndices(event.container.data);

        await this.taskmanagementService.updateStatus(task.TASK_ID, { task_status: status });
        await this.taskmanagementService.updateOrderIndices([...sourceUpdates, ...destUpdates]);
        
    }

    private getStatusFromContainer(containerId: string): StatusChange['task_status'] {
        switch (containerId) {
            case 'todo':
                return 'To do';
            case 'progress':
                return 'In progress';
            case 'feedback':
                return 'Await feedback';
            case 'done':
                return 'Done';
            default:
                throw new Error(`Unknown container: ${containerId}`);
        }
    }

    private calculateNewOrderIndices(containerData: Task[]): { TASK_ID: number; order_index: number }[] {
        return containerData.map((task, index) => ({
            TASK_ID: task.TASK_ID,
            order_index: index,
        }));
    }
}