import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
    NgSelectComponent,
    NgOptionTemplateDirective,
    NgMultiLabelTemplateDirective,
} from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProfileService } from '../../services/profile-service';
import { validate } from '@angular/forms/signals';
import { TaskChanges } from '../../interfaces/task';
import { Taskmanagement } from '../../services/taskmanagement';

@Component({
    selector: 'app-task-form',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        NgSelectComponent,
        CommonModule,
        NgMultiLabelTemplateDirective,
        NgOptionTemplateDirective,
        FormsModule,
    ],
    templateUrl: './task-form.html',
    styleUrl: './task-form.scss',
})
export class TaskForm {
    priorities = [
        {
            for: 'option-urgent',
            value: 'urgent',
            optionId: 'option-urgent',
            imgUrl: './assets/icons/Prio urgent.png',
            imgAlt: 'priority urgent icon',
            text: 'Urgent',
        },
        {
            for: 'option-medium',
            value: 'medium',
            optionId: 'option-medium',
            imgUrl: './assets/icons/Prio medium.png',
            imgAlt: 'priority medium icon',
            text: 'Medium',
        },
        {
            for: 'option-low',
            value: 'low',
            optionId: 'option-low',
            imgUrl: './assets/icons/Prio low.png',
            imgAlt: 'priority low icon',
            text: 'Low',
        },
    ];
    categories = [{ name: 'Technical Task' }, { name: 'User Story' }];
    profileService = inject(ProfileService);
    taskService = inject(Taskmanagement);

    taskForm = new FormGroup({
        title: new FormControl('', { nonNullable: true }),
        description: new FormControl('', { nonNullable: true }),
        dueDate: new FormControl('', { nonNullable: true }),
        priority: new FormControl('medium', { nonNullable: true }),
        member: new FormControl('', { nonNullable: true }),
        category: new FormControl('', { nonNullable: true }),
        subtask: new FormControl('', { nonNullable: true }),
        status: new FormControl('', {nonNullable: true}),
        // eigene submit function, signal mit tasks arr, mit for gerendert
    });

    constructor() {
        void this.profileService.ensureProfilesLoaded();
    }

    // createTask() {
    //     console.log(this.taskForm.value);
    // }

    get title() {
        return this.taskForm.get('title');
    }

    get description() {
        return this.taskForm.get('description');
    }
    get dueDate() {
        return this.taskForm.get('dueDate');
    }

    get priority() {
        return this.taskForm.get('priority');
    }
    get category() {
        return this.taskForm.get('category');
    }

    get status() {
        return this.taskForm.get('status');
    }

    async createTask() {
        this.taskForm.patchValue({
            title: this.title?.value ?? '',
            description: this.description?.value ?? '',
            dueDate: this.dueDate?.value ?? '',
            priority: this.priority?.value ?? 'medium',
            category: this.category?.value ?? '',
            status: this.status?.value ?? 'To do',
        });

        if (!this.taskForm.valid) {
            this.taskForm.markAllAsTouched();
            return;
        }

        const values = this.taskForm.getRawValue();
        const changes: TaskChanges = {
            task_title: values.title,
            task_description: values.description,
            task_due_date: values.dueDate,
            task_priority: values.priority,
            task_status: 'To do',
            task_category: values.category,
            order_index: this.taskService.todo().length
            
        };
            console.log(this.taskService.todo().length);


        await this.taskService.createTask(changes);

        // try {
        //     if (this.dialogService.dialogMode() === 'edit') {
        //         const selected = this.profileService.selectedProfile();

        //         if (!selected) {
        //             return;
        //         }

        //         const updated = await this.profileService.updateProfile(selected.id, changes);
        //         this.profileService.selectedProfile.set(updated);
        //         this.notificationService.show(`${updated.user_name} was updated`);
        //     } else {
        //         const created = await this.profileService.createProfile(changes);
        //         this.profileService.scrollToNewContact.set(created.id);
        //         this.notificationService.show(`${created.user_name} was created`);
        //         void this.router.navigate(['/contacts', created.id]);
        //     }

        //     this.dialogService.closeDialog();
        // } catch (error) {
        //     this.notificationService.show('The contact could not be saved. Please try again.');
        // }
    }
}
