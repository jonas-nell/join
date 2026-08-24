import { Component, effect, inject } from '@angular/core';
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

@Component({
    selector: 'app-board',
    imports: [AddTaskButton, SearchBar, CdkDrag, CdkDropList, CdkDropListGroup, CdkDragPlaceholder],
    templateUrl: './board.html',
    styleUrl: './board.scss',
})
export class Board {
    readonly taskmanagementService = inject(Taskmanagement);

    // progress: Task[] = [];

    // feedback: Task[] = [];

    // done: Task[] = [];

    constructor() {
        // effect(() => {
        //     const allTasks = this.taskmanagementService.tasks();
        //     this.sortTasks(allTasks);
        //     console.log(this.todo);
        //     console.log(this.progress);
        //     console.log(this.feedback);
        //     console.log(this.done);
        // });
        // void (this.taskmanagementService.ensureTasksLoaded());
        // const allTasks = this.taskmanagementService.tasks();
        // this.sortTasks(allTasks);
        // console.log(this.todo);
        // console.log(this.progress);
        // console.log(this.feedback);
        // console.log(this.done);
        // this.postBackDatabase();
    }

    //provisional function
    async postBackDatabase() {
        // const changes : TaskChanges = {
        //     task_status:
        // }

        const changes: StatusChange = {
            task_status: 'Done',
        };

        await this.taskmanagementService.updateStatus(3, changes);
    }

    // drop(event: CdkDragDrop<Task[]>) {
    //     if (event.previousContainer === event.container) {
    //         moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    //     } else {
    //         transferArrayItem(
    //             event.previousContainer.data,
    //             event.container.data,
    //             event.previousIndex,
    //             event.currentIndex,
    //         );
    //     }
    // }

    drop(event: CdkDragDrop<Task[]>): void {
        const task = event.previousContainer.data[event.previousIndex];

        const newStatus = this.getStatusFromContainer(event.container.id);

        if (event.previousContainer === event.container) {
            this.taskmanagementService.moveTaskWithinColumn(task.TASK_ID, event.currentIndex);

            return;
        }

        this.taskmanagementService.moveTaskToColumn(task.TASK_ID, newStatus, event.currentIndex);
    }

    getStatusFromContainer(id: string) {
        switch (id) {
            case 'todoList':
                return 'To do';

            case 'progressList':
                return 'In progress';

            case 'feedbackList':
                return 'Await feedback';

            case 'doneList':
                return 'Done';

            default:
                throw new Error(`Unknown drop list: ${id}`);
        }
    }
}

//update fucntion wird aufgerufen (id, changes)
// const updated = await this.profileService.updateProfile(selected.id, changes);
