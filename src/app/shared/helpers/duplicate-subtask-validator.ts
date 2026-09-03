import {
    AbstractControl,
    FormArray,
    FormGroup,
    ValidationErrors,
    ValidatorFn,
} from '@angular/forms';

export function duplicateSubtaskValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        if (!control.parent) {
            return null;
        }

        const subtaskGroup = control.parent as FormGroup;
        const subtaskArray = subtaskGroup.parent as FormArray | null;

        if (!subtaskArray) {
            return null;
        }

        const title = (control.value ?? '').trim().toLowerCase();
        if (!title) {
            return null;
        }

        const isDuplicate = subtaskArray.controls.some((group) => {
            if (group === subtaskGroup) {
                return false;
            }
            const otherTitle = (group.get('subtask_title')?.value ?? '').trim().toLowerCase();
            return otherTitle === title;
        });

        return isDuplicate ? { duplicateSubtask: true } : null;
    };
}
