import { Component, inject } from '@angular/core';
import { DialogService } from '../../services/dialog-service';
import { Taskmanagement } from '../../services/taskmanagement';

@Component({
    selector: 'app-add-task-button',
    imports: [],
    templateUrl: './add-task-button.html',
    styleUrl: './add-task-button.scss',
})
export class AddTaskButton {
    dialogService = inject(DialogService);
    taskmanagement = inject(Taskmanagement);
}


