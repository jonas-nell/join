import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function passwordConfirm(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const password = control.parent?.get('password')?.value;
        return control.value != password ? { notSamePassword: { value: control.value } } : null;
    };
}
