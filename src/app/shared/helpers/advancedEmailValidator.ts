import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export function advancedEmailValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const value: string = control.value;
            if (!value) return null;

            const atIndex = value.indexOf('@');
            if (atIndex === -1) return null;

            const domain = value.slice(atIndex + 1);

            const dotCount = (domain.match(/\./g) || []).length;
            if (dotCount > 2) {
                return { tooManyDots: true};
            }

            if (/[^a-zA-Z0-9]{2,}/.test(value)) {
                return {adjacentSpecialCharacters: true};
            }

            return null;
        };
    }