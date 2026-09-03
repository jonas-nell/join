import {
    AbstractControl,
    ValidationErrors,
    ValidatorFn,
} from '@angular/forms';


// Converts a Date to the YYYY-MM-DD format required by an HTML date input.

export function formatLocalDate(date: Date = new Date()): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

// Rejects dates before the current local date
export function notBeforeTodayValidator(): ValidatorFn {
    return (
        control: AbstractControl<string>,
    ): ValidationErrors | null => {
        if (!control.value) {
            return null;
        }

        const today = formatLocalDate();

        return control.value < today
            ? { beforeToday: true }
            : null;
    };
}