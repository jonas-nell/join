import { Component } from '@angular/core';
import { TaskForm } from "../../shared/components/task-form/task-form";

@Component({
    selector: 'app-add-task',
    imports: [TaskForm],
    templateUrl: './add-task.html',
    styleUrl: './add-task.scss',
})
export class AddTask {}
