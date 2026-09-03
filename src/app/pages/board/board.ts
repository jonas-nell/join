import { Component, effect, inject, computed, signal } from '@angular/core';
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
import { SingleTaskView } from './single-task-view/single-task-view';
import { BreakpointObserver } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { TaskMembers } from '../../shared/services/task-members';
import { DialogService } from '../../shared/services/dialog-service';
import { TaskForm } from "../../shared/components/task-form/task-form";
import { Dialog } from '../../shared/directives/dialog-directive';
import { ResponsiveService } from '../../shared/services/responsive-service';

@Component({
    selector: 'app-board',
    imports: [AddTaskButton, SearchBar, CdkDropList, CdkDropListGroup, TaskCard, SingleTaskView, TaskForm, Dialog],
    templateUrl: './board.html',
    styleUrl: './board.scss',
})
export class Board {
    
    readonly taskmanagementService = inject(Taskmanagement);
    private breakpointObserver = inject(BreakpointObserver);
    readonly dialogService = inject(DialogService);
    taskMembers = inject(TaskMembers);
    responsive = inject(ResponsiveService);
    
    constructor() {
        this.loadData(); 
        effect(() => {
            const taskId = this.taskmanagementService.scrollToNewTask();
            const tasks = this.taskmanagementService.tasks();

            if (!taskId || !tasks.length){
                return;
            }
            setTimeout(() => {
                const task = document.getElementById(`task-${taskId}`);

                if(!task) {
                    return;
                }

                task.scrollIntoView({
                    block:'center'
                });

                this.taskmanagementService.scrollToNewTask.set(null);
            });
        });       
    }

    // loads task data and task member data
    async loadData(){
        await this.taskmanagementService.ensureTasksLoaded();
        for (const task of this.taskmanagementService.tasks()){
            await this.taskMembers.setTaskMembers(task.TASK_ID)
        }
    }

    
    
    async drop(event: CdkDragDrop<Task[]>) {
        const task = event.previousContainer.data[event.previousIndex];

        if (event.previousContainer === event.container) {
            //reoder within a column: making local copy to avoid directly mutating computed array
            const reordered = [...event.container.data];
            moveItemInArray(reordered, event.previousIndex, event.currentIndex);
            const updates = this.calculateNewOrderIndices(reordered);
            // useing optimistically so UI updates happen immediately (no waiting for db echoing)
            this.taskmanagementService.reorderLocally(task.TASK_ID, null, updates);
            await this.taskmanagementService.updateOrderIndices(updates);
            return;
        }

        // move over columns; same as above, but source and destination copies
        const sourceData = [...event.previousContainer.data];
        const destData = [...event.container.data];
        transferArrayItem(sourceData, destData, event.previousIndex, event.currentIndex);

        const status = this.getStatusFromContainer(event.container.id);
        const sourceUpdates = this.calculateNewOrderIndices(sourceData);
        const destUpdates = this.calculateNewOrderIndices(destData);

        //local update before pushing to DB
        this.taskmanagementService.reorderLocally(task.TASK_ID, status, [
            ...sourceUpdates,
            ...destUpdates,
        ]);

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

    private calculateNewOrderIndices(
        containerData: Task[],
    ): { TASK_ID: number; order_index: number }[] {
        return containerData.map((task, index) => ({
            TASK_ID: task.TASK_ID,
            order_index: index,
        }));
    }
}


