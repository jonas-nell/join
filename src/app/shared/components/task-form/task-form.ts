//#region imports
import { Component, inject, signal } from '@angular/core';
import {
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators,
    FormArray,
    FormBuilder,
} from '@angular/forms';
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
import { TaskModel } from '../../models/task-model';
import { validate } from '@angular/forms/signals';
import { UserBadge } from "../user-badge/user-badge";
//#endregion

interface SubtaskForm {
    subtask_title: FormControl<string>;
    subtask_done: FormControl<boolean>;
    // task_id :
}

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
    UserBadge
],
    templateUrl: './task-form.html',
    styleUrl: './task-form.scss',
})
export class TaskForm {
    //#region properties

    //#region inject
    profileService = inject(ProfileService);
    taskService = inject(Taskmanagement);
    fb = inject(FormBuilder);
    //#endregion

    priorities = [
        {
            for: 'option-urgent',
            value: 'urgent',
            optionId: 'option-urgent',
            imgUrl: './assets/icons/Prio urgent.png',
            imgUrlWhite: './assets/icons/Prio urgent white.png',
            imgAlt: 'priority urgent icon',
            text: 'Urgent',
        },
        {
            for: 'option-medium',
            value: 'medium',
            optionId: 'option-medium',
            imgUrl: './assets/icons/Prio medium.png',
            imgUrlWhite: './assets/icons/Prio medium white.png',
            imgAlt: 'priority medium icon',
            text: 'Medium',
        },
        {
            for: 'option-low',
            value: 'low',
            optionId: 'option-low',
            imgUrl: './assets/icons/Prio low.png',
            imgUrlWhite: './assets/icons/Prio low white.png',
            imgAlt: 'priority low icon',
            text: 'Low',
        },
    ];
    categories = [{ name: 'Technical Task' }, { name: 'User Story' }];

    editingSubtaskIndex: number | null = null;
    originalSubtaskTitle = '';

    taskForm = new FormGroup({
        task_title: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
        task_description: new FormControl('', {
            nonNullable: true,
        }),
        task_due_date: new FormControl('', {
            nonNullable: true,
            validators: [Validators.required],
        }),
        task_priority: new FormControl('medium', {
            nonNullable: true,
        }),
        member: new FormControl<Profile[]>([], { nonNullable: true }),
        task_category: new FormControl('', {
            nonNullable: true,
            validators: [Validators.required],
        }),
        subtaskInput: new FormControl('', { nonNullable: true }),
        subtasks: this.fb.array<FormGroup<SubtaskForm>>([]),
    });
    //#endregion

    constructor() {
        // sicherstellen, dass kontakte geladen sind wenn das taskform geöffnet ist
        void this.profileService.ensureProfilesLoaded();
    }

    //#region methods

    //#region getter functions
    get task_title() {
        return this.taskForm.get('task_title');
    }

    get task_description() {
        return this.taskForm.get('task_description');
    }
    get task_due_date() {
        return this.taskForm.get('dtask_due_date');
    }

    get task_priority() {
        return this.taskForm.get('task_priority');
    }
    get task_category() {
        return this.taskForm.get('task_category');
    }

    get task_status() {
        return this.taskForm.get('task_status');
    }

    get subtask() {
        return this.taskForm.get('subtaskInput');
    }

    get subTasks(): FormArray<FormGroup<SubtaskForm>> {
        return this.taskForm.controls.subtasks;
    }
    //#endregion

    //#region subtask
    //#region add subtask
    createSubtask(title: string): FormGroup<SubtaskForm> {
        return this.fb.group({
            subtask_title: this.fb.nonNullable.control(title || '', {
                validators: [Validators.required],
            }),
            subtask_done: this.fb.nonNullable.control(false),
        });
    }

    // value aus add subtask input auslesen (title) und weitergeben an createSubtask()
    addSubtaskk(event: Event): void {
        event.preventDefault();
        const newSubtask = this.subtask?.value.trim();
        if (newSubtask && !this.isDoubleSubtask(newSubtask)) {
            this.subTasks.push(this.createSubtask(newSubtask));
            this.clearSubtaskInput(event);
            console.log(this.subTasks.value);
        }
    }

    isDoubleSubtask(subtaskTitle: string): boolean {
        return this.subTasks.value.some((subtask) => subtask.subtask_title === subtaskTitle);
    }
    //#endregion

    //#region edit subtask
    editSubtask(subtaskIndex: number) {
        const subtask = this.subTasks.at(subtaskIndex);
        // titel vor bearbeitung zwischenspeichern
        this.originalSubtaskTitle = subtask.controls.subtask_title.value;
        // vergeben, damit im html entsprechendes input geladen wird
        this.editingSubtaskIndex = subtaskIndex;
    }

    // speichert bearbeiteten subtask
    saveSubtask(subtaskIndex: number) {
        const subtask = this.subTasks.at(subtaskIndex);
        const title = subtask.controls.subtask_title.value;
        // if (!title) {
        //     subtask.controls.title.markAsTouched();
        //     return
        // }
        subtask.controls.subtask_title.setValue(title);

        this.editingSubtaskIndex = null;
        this.originalSubtaskTitle = '';
    }

    // bearbeiten abbrechen, subtask bekommt ursprünglichen titel
    cancelEditSubtask() {
        if (this.editingSubtaskIndex === null) {
            return;
        }

        const subtask = this.subTasks.at(this.editingSubtaskIndex);

        subtask.controls.subtask_title.setValue(this.originalSubtaskTitle);

        this.editingSubtaskIndex = null;
        this.originalSubtaskTitle = '';
    }

    // speichert editierten subtask auf enter
    // bricht bearbeiten ab bei esc
    onEditSubtaskKeydown(event: KeyboardEvent, index: number): void {
        if (event.key === 'Enter') {
            event.preventDefault();
            this.saveSubtask(index);
        }

        if (event.key === 'Escape') {
            event.preventDefault();
            this.cancelEditSubtask();
        }
    }
    //#endregion

    //#region remove subtask
    removeSubtask(subtaskIndex: number) {
        this.subTasks.removeAt(subtaskIndex);
    }
    //#endregion

    //#region clear subtask input
    clearSubtaskInput(event: Event): void {
        event.preventDefault();
        this.subtask?.reset();
    }
    //#endregion
    //#endregion

    //#region create task
    async createTask() {
        this.taskService.ensureTasksLoaded();
        // abfrage ob ein titel vorhanden + ob eine andere task den title schon hat
        if (this.task_title && !this.taskService.isDoubleTask(this.task_title?.value)) {
            // if (!this.taskForm.valid) {
            //     this.taskForm.markAllAsTouched();
            //     return;
            // }

            // task ganz unten in liste einfügen
            const orderIndex = this.taskService.todo().length;
            const rawValues = this.taskForm.getRawValue();
            const taskValues = new TaskModel(rawValues, orderIndex);

            // TASK_ID nicht mitgeben, da von DB erstellt
            const { TASK_ID, subtasks, ...taskValuesNeeded } = taskValues;
            console.log(taskValuesNeeded);
            console.log(taskValues);

            await this.taskService.addTaskDB(taskValuesNeeded, this.memberArray(), subtasks);
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
