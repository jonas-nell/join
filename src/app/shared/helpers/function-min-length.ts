
import {
    AbstractControl,
    ValidationErrors,
    ValidatorFn,
} from '@angular/forms';

export function minLengthWithoutSpaces(minLength: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        let trimmedLength;
        if (control.value) {
            const trimmed = control.value.trim();
            trimmedLength = trimmed.length;
        }
        return trimmedLength < minLength ? { stringTooShort: { value: control.value } } : null;
    };
}
