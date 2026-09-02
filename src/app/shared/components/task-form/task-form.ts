//#region imports
import { Component, computed, effect, inject, input, signal } from '@angular/core';
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
import { Subtask, Task, TaskChanges } from '../../interfaces/task';
import { Taskmanagement } from '../../services/taskmanagement';
import { Profile } from '../../interfaces/profile';
import { TaskModel } from '../../models/task-model';
import { validate } from '@angular/forms/signals';
import { UserBadge } from '../user-badge/user-badge';
import { DialogService } from '../../services/dialog-service';
import { TaskMembers } from '../../services/task-members';
import { doubleTitle } from '../../helpers/double-title-validator';
//#endregion

interface SubtaskForm {
    subtask_title: FormControl<string>;
    subtask_done: FormControl<boolean>;
    id: FormControl<number | undefined>;
    task_id: FormControl<number | undefined>;
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
        UserBadge,
    ],
    templateUrl: './task-form.html',
    styleUrl: './task-form.scss',
})
export class TaskForm {
    //#region properties

    //#region inject
    profileService = inject(ProfileService);
    taskService = inject(Taskmanagement);
    dialogService = inject(DialogService);
    taskMembers = inject(TaskMembers);
    fb = inject(FormBuilder);
    //#endregion

    modeAdd = computed(() => this.taskService.taskFormMode() == 'add');
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
        task_title: new FormControl('', {
            nonNullable: true,
            validators: [
                Validators.required,
                doubleTitle(this.taskService.tasks, this.taskService.currentTaskId),
            ],
        }),
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

        effect(() => {
            const taskFormOpen = this.taskService.taskFormMode();

            if (taskFormOpen == 'edit') {
                this.fillTaskForm();
            } else if (taskFormOpen == 'add') {
                this.clearTaskInput();
                this.subTasks.clear();
            }
        });
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

    //#region fill/reset form
    fillTaskForm() {
        if (this.taskService.currentTask() && this.dialogService.dialogMode() == 'edit') {
            const currentTask = this.taskService.currentTask();
            this.taskForm.patchValue({
                task_title: currentTask?.task_title ?? '',
                task_description: currentTask?.task_description ?? '',
                task_due_date: currentTask?.task_due_date ?? '',
                task_priority: currentTask?.task_priority ?? '',
                member: [],
                task_category: currentTask?.task_category ?? '',
                subtaskInput: '',
            });
            this.setSubtasks();
        }
    }

    // set subtask values in edit mode
    setSubtasks() {
        const taskId = this.taskService.currentTask()?.TASK_ID;
        if (!taskId) {
            return;
        }
        const subtasks = this.taskService.subtasks()[taskId] ?? [];
        this.subTasks.clear();
        for (const subtask of subtasks) {
            this.subTasks.push(
                this.createSubtask(
                    subtask.subtask_title,
                    subtask.subtask_done,
                    subtask.id,
                    subtask.task_id,
                ),
            );
        }
        console.log(this.subTasks);
    }

    clearTaskInput(): void {
        this.taskForm.reset();
    }

    clearTaskForm(event: Event): void {
        event.preventDefault();
        this.taskForm.reset();
    }

    clearSubtaskInput(event: Event): void {
        event.preventDefault();
        this.subtask?.reset();
    }
    //#endregion

    //#region submit form
    // method for form submit, creates task if in add mode, edits task if in edit mode
    async setTask() {
        this.taskService.ensureTasksLoaded();
        if (this.task_title?.valid && this.taskForm.valid) {
            if (this.taskService.taskFormMode() == 'add') {
                await this.createTask();
            } else if (this.taskService.taskFormMode() == 'edit') {
                this.editFormValues();
                console.log('edit');
            }
        }
    }
    //#endregion

    //#region task
    //#region create task
    async createTask() {
        const orderIndex = this.taskService.todo().length;
        const rawValues = this.taskForm.getRawValue();
        const taskValues = new TaskModel(rawValues, orderIndex);

        // TASK_ID nicht mitgeben, da von DB erstellt
        const { TASK_ID, subtasks, ...taskValuesNeeded } = taskValues;

        await this.taskService.addTaskDB(taskValuesNeeded, this.memberArray(), subtasks);

        this.clearTaskInput();
        this.dialogService.closeDialog();
        this.taskService.taskFormMode.set(null);
    }
    //#endregion

    //#region task edit
    async editFormValues() {
        const orderIndex = this.taskService.currentTask()?.order_index;
        const taskId = this.taskService.currentTask()?.TASK_ID;
        const rawValues = this.taskForm.getRawValue();
        const taskValues = new TaskModel(rawValues, orderIndex, taskId);
        const { subtasks, ...taskValuesNeeded } = taskValues;

        if (taskId) {
            this.taskService.editTask(taskValuesNeeded);
            this.taskService.updateTask(taskId, taskValuesNeeded);

            this.taskService.addSubtasks(this.onlyNewSubtasks(subtasks), taskId);
            this.editSubtasks(taskId, subtasks);

            this.editTaskMembers(taskId);
            this.clearTaskInput();
            this.dialogService.closeDialog();

            if (this.taskService.taskFormMode() == 'edit') {
                this.dialogService.openDialog('single-task');
            }
            this.taskService.taskFormMode.set(null);
        }
    }
    //#endregion
    //#endregion

    //#region subtask

    // returns subtask form group (for FormArray)
    createSubtask(
        title: string,
        done: boolean = false,
        subtaskId: number | undefined = undefined,
        taskId: number | undefined = undefined,
    ): FormGroup<SubtaskForm> {
        return this.fb.group({
            subtask_title: this.fb.nonNullable.control(title || '', {
                validators: [Validators.required],
            }),
            subtask_done: this.fb.nonNullable.control(done),
            id: this.fb.nonNullable.control(subtaskId || undefined),
            task_id: this.fb.nonNullable.control(taskId || undefined),
        });
    }

    isDoubleSubtask(subtaskTitle: string): boolean {
        return this.subTasks.value.some((subtask) => subtask.subtask_title === subtaskTitle);
    }

    //#region add subtask

    // value aus add subtask input auslesen (title) und weitergeben an createSubtask()
    // wird nur in form hinzugefügt, nicht lokal oder auf der db gespeichert
    addSubtaskk(event: Event): void {
        event.preventDefault();
        const newSubtask = this.subtask?.value.trim();
        if (newSubtask && !this.isDoubleSubtask(newSubtask)) {
            this.subTasks.push(this.createSubtask(newSubtask));
            this.clearSubtaskInput(event);
        }
    }

    onAddSubtaskKeydown(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            this.addSubtaskk(event);
        }
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

    // speichert bearbeiteten subtask im form
    saveSubtask(subtaskIndex: number) {
        const subtask = this.subTasks.at(subtaskIndex);
        const title = subtask.controls.subtask_title.value;
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

    // updates existing subtasks in subtask signal
    editSubtasks(taskId: number, subtasks: Subtask[]) {
        for (const subtask of subtasks) {
            if (subtask.id && taskId) {
                this.taskService.updateSubtasks(subtask.id, taskId, subtask);
            }
        }
    }

    // returns array containing only new subtasks so it can be inserted into db
    onlyNewSubtasks(subtasks: Subtask[]): Subtask[] {
        const newSubtasks: Subtask[] = [];
        for (const subtask of subtasks) {
            if (!subtask.id) {
                newSubtasks.push(subtask);
            }
        }
        return newSubtasks;
    }
    //#endregion

    //#region remove subtask
    removeSubtask(subtaskIndex: number) {
        const subtask = this.subTasks.at(subtaskIndex);
        const subtaskId = subtask.controls.id.value;
        const taskId = subtask.controls.task_id.value;
        this.subTasks.removeAt(subtaskIndex);
        if (subtaskId && taskId) {
            this.taskService.deleteSubtaskLocal(subtaskId, taskId);
            this.taskService.deleteSubTask(subtaskId);
        }
    }
    //#endregion
    //#endregion

    //#region taskmembers
    editTaskMembers(taskId: number) {
        this.taskMembers.updateTaskMembers(taskId, this.memberIdArr(this.memberArray()));
    }

    // array mit objects von task zugewiesenen kontakten wird zurückgegeben
    memberArray(): Profile[] {
        let memberArr: Profile[] = [];
        if (this.taskForm.value.member) {
            memberArr = this.taskForm.value.member;
        }
        return memberArr;
    }

    memberIdArr(members: Profile[]): string[] {
        const idArr = [];
        if (members) {
            for (const member of members) {
                idArr.push(member.id);
            }
        }
        return idArr;
    }
    //#endregion
    //#endregion
}
