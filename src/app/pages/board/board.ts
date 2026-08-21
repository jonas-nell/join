import { Component, effect, inject } from '@angular/core';
import { SearchBar } from './search-bar/search-bar/search-bar';
import { AddTaskButton } from '../../shared/components/add-task-button/add-task-button';
import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray, transferArrayItem, CdkDropListGroup, CdkDragPlaceholder } from '@angular/cdk/drag-drop';
import { Task } from '../../shared/interfaces/task';
import { Taskmanagement } from '../../services/taskmanagement';
import { StatusChange } from '../../shared/interfaces/task';


@Component({
    selector: 'app-board',
    imports: [AddTaskButton, SearchBar, CdkDrag, CdkDropList, CdkDropListGroup, CdkDragPlaceholder],
    templateUrl: './board.html',
    styleUrl: './board.scss',
})
export class Board {
    readonly taskmanagementService = inject(Taskmanagement);

    todo: Task[] = [];
    
    progress: Task[] = [];
    
    feedback: Task[] = [];
    
    done: Task[] = [];

    constructor() {
        this.taskmanagementService.ensureTasksLoaded();
        //signal based getting all tasks
        effect(() => {
            const allTasks = this.taskmanagementService.tasks();
            this.sortTasks(allTasks);          
            console.log(this.todo);
            console.log(this.progress);
            console.log(this.feedback);
            console.log(this.done);
        });

        this.postBackDatabase();
        
    }

    sortTasks(allTasks: Task[]){
        this.todo = allTasks.filter((t) => t.task_status === 'To do');
        this.progress = allTasks.filter((t) => t.task_status === 'In progress');
        this.feedback = allTasks.filter((t) => t.task_status === 'Await feedback');
        this.done = allTasks.filter((t) => t.task_status === 'Done');
    }

    //provisional function
    async postBackDatabase(){
        // const changes : TaskChanges = {
        //     task_status: 
        // }

        const changes: StatusChange = {
            task_status: 'Done'
                };

        await this.taskmanagementService.updateStatus(3, changes);
    }


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


//update fucntion wird aufgerufen (id, changes)
// const updated = await this.profileService.updateProfile(selected.id, changes);
