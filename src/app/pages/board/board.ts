import { Component } from '@angular/core';
import { SearchBar } from './search-bar/search-bar/search-bar';
import { AddTaskButton } from '../../shared/components/add-task-button/add-task-button';
import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray, transferArrayItem, CdkDropListGroup, CdkDragPlaceholder } from '@angular/cdk/drag-drop';
import { Task } from '../../shared/interfaces/task';

@Component({
    selector: 'app-board',
    imports: [AddTaskButton, SearchBar, CdkDrag, CdkDropList, CdkDropListGroup, CdkDragPlaceholder],
    templateUrl: './board.html',
    styleUrl: './board.scss',
})
export class Board {
    todo: Task[] = ['task1', 'task2', 'task3', 'task4', 'task5', 'task6'];
    
    progress: Task[] = [];
    
    feedback: Task[] = [];
    
    done: Task[] = ['task7', 'task8', 'task9', 'task10'];


    drop(event: CdkDragDrop<string[]>) {
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
