import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Task } from '../interfaces/task';
import { Signal } from '@angular/core';

export function doubleTitle(
    taskArr: Signal<Task[]>,
    currentTaskId: Signal<number | null>,
): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const tasks = taskArr();
        const currentId = currentTaskId();

        const isDuplicate = tasks.some(
            (task) => task.task_title === control.value && task.TASK_ID !== currentId,
        );

        return isDuplicate ? { doubleTaskTitle: { value: control.value } } : null;
    };
}
