import { Component, inject } from '@angular/core';
import { DialogService } from '../../services/dialog-service';
import { Taskmanagement } from '../../services/taskmanagement';
import { Router } from '@angular/router';
import { ResponsiveService } from '../../services/responsive-service';

@Component({
    selector: 'app-add-task-button',
    imports: [],
    templateUrl: './add-task-button.html',
    styleUrl: './add-task-button.scss',
})
export class AddTaskButton {
    dialogService = inject(DialogService);
    taskmanagement = inject(Taskmanagement);
    private router = inject(Router);
    private responsive = inject(ResponsiveService);


    onAddTaskClick(){
        if (this.responsive.isDesktop()){
            this.dialogService.openDialog('task-form', 'add');
        } else {
            this.router.navigate(['/add-task']);
        }
    }
}


