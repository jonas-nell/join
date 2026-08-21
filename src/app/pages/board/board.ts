import { Component, inject } from '@angular/core';
import { SearchBar } from './search-bar/search-bar/search-bar';
import { AddTaskButton } from '../../shared/components/add-task-button/add-task-button';
import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray, transferArrayItem, CdkDropListGroup, CdkDragPlaceholder } from '@angular/cdk/drag-drop';
import { Task } from '../../shared/interfaces/task';
import { Taskmanagement } from '../../services/taskmanagement';

@Component({
    selector: 'app-board',
    imports: [AddTaskButton, SearchBar, CdkDrag, CdkDropList, CdkDropListGroup, CdkDragPlaceholder],
    templateUrl: './board.html',
    styleUrl: './board.scss',
})
export class Board {
    readonly taskmanagementService = inject(Taskmanagement);

    allTasks:Task[] = [];

    todo: Task[] = [];
    
    progress: Task[] = [];
    
    feedback: Task[] = [];
    
    done: Task[] = [];

    constructor() {
        this.test();
        this.allTasks = this.taskmanagementService.tasks();
        console.log(this.allTasks);
        
        
        // this.sortTasks();
        
    }

    async test(){
        await this.taskmanagementService.ensureTasksLoaded();
    }
    
    //sort and split tasks based on their status form db
    // async sortTasks() {
    //     console.log('test');
        
    //     this.allTasks = await this.taskmanagementService.ensureTasksLoaded();
    //     console.log(this.allTasks);

    // }


    drop(event: CdkDragDrop<Task[]>) {
        if (event.previousContainer === event.container) {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        } else {
            transferArrayItem(
                event.previousContainer.data,
                event.container.data,
                event.previousIndex,
                event.currentIndex,
            );
        }
    }
}
