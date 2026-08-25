//#region imports
import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
    NgSelectComponent,
    NgOptionTemplateDirective,
    NgMultiLabelTemplateDirective,
} from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProfileService } from '../../services/profile-service';
import { TaskChanges } from '../../interfaces/task';
import { Taskmanagement } from '../../services/taskmanagement';
import { Profile } from '../../interfaces/profile';
//#endregion

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
    //#region properties

    //#region properties services
    profileService = inject(ProfileService);
    taskService = inject(Taskmanagement);
    //#endregion

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
    subtasks: string[] = [];

    taskForm = new FormGroup({
        title: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
        description: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
        dueDate: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
        priority: new FormControl('medium', {
            nonNullable: true,
            validators: [Validators.required],
        }),
        member: new FormControl(null),
        category: new FormControl('', { nonNullable: true }),
        subtask: new FormControl('', { nonNullable: true }),
        status: new FormControl('To do', { nonNullable: true }),
    });
    //#endregion

    constructor() {
        // sicherstellen, dass kontakte geladen sind wenn das taskform geöffnet ist
        void this.profileService.ensureProfilesLoaded();
    }

    //#region methods

    //#region getter functions
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

    get subtask() {
        return this.taskForm.get('subtask');
    }
    //#endregion

    //#region create subtask

    addSubtask(event: Event): void {
        // verhindert default submit eigentschaft (button)
        event.preventDefault();
        // subtask input value kommt in array für datenbank
        const subtask = this.subtask?.value;
        // abfrage ob subtask title schon existiert
        if (subtask && !this.ckeckDoubleSubtask(subtask)) {
            this.subtasks.push(subtask);
        }
        this.clearSubtaskInput(event);
    }

    ckeckDoubleSubtask(subtask: string) {
        const doubleSubtask: boolean = this.subtasks.includes(subtask);
        return doubleSubtask;
    }

    clearSubtaskInput(event: Event): void {
        event.preventDefault();
        this.subtask?.reset();
    }
    //#endregion

    //#region create task
    async createTask() {
        this.taskService.ensureTasksLoaded();
        // abfrage ob ein titel vorhanden + ob eine andere task den title schon hat
        if (this.title && !this.taskService.isDoubleTask(this.title?.value)) {
            // if (!this.taskForm.valid) {
            //     this.taskForm.markAllAsTouched();
            //     return;
            // }

            const changes: TaskChanges = {
                task_title: this.title.value,
                task_description: this.description?.value ?? '',
                task_due_date: this.dueDate?.value ?? '',
                task_priority: this.priority?.value ?? 'medium',
                task_status: this.status?.value ?? 'To do',
                task_category: this.category?.value ?? '',
            };

            await this.taskService.createTask(changes, this.memberArray(), this.subtasks);
            this.clearTaskaskInput();
        }

        // this.taskForm.patchValue({
        //     title: this.title?.value ?? '',
        //     description: this.description?.value ?? '',
        //     dueDate: this.dueDate?.value ?? '',
        //     priority: this.priority?.value ?? 'medium',
        //     category: this.category?.value ?? '',
        //     status: this.status?.value ?? 'To do',
        // });

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

    // array mit objects von task zugewiesenen kontakten wird zurückgegeben
    memberArray(): Profile[] {
        let memberArr: Profile[] = [];
        if (this.taskForm.value.member) {
            memberArr = this.taskForm.value.member;
        }
        return memberArr;
    }

    clearTaskaskInput(): void {
        this.subtask?.reset();
    }
    //#endregion

    //#endregion
}
