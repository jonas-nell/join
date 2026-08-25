import { Component, input } from '@angular/core';
import { CdkDrag, CdkDragPlaceholder } from '@angular/cdk/drag-drop';
import { Task } from '../../../shared/interfaces/task';

@Component({
    selector: 'app-task-card',
    imports: [CdkDrag ,CdkDragPlaceholder],
    templateUrl: './task-card.html',
    styleUrl: './task-card.scss',
})
export class TaskCard {
    task = input.required<Task>();
}
