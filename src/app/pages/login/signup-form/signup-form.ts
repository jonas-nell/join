import { Component, inject } from '@angular/core';
import { DatabaseService } from '../../../shared/services/database-service';
import { Router, RouterLink } from '@angular/router';
import {
    FormBuilder,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { ProfileService } from '../../../shared/services/profile-service';
import { minLengthWithoutSpaces } from '../../../shared/helpers/function-min-length';
import { advancedEmailValidator } from '../../../shared/helpers/advancedEmailValidator';
import { passwordConfirm } from '../../../shared/helpers/password-confirmation-valid';

@Component({
    selector: 'app-signup-form',
    imports: [FormsModule, ReactiveFormsModule, RouterLink],
    templateUrl: './signup-form.html',
    styleUrl: './signup-form.scss',
})
export class SignupForm {
    //#region properties
    databaseService = inject(DatabaseService);
    router = inject(Router);
    profileService = inject(ProfileService);

    fb = inject(FormBuilder);

    loading = false;
    errorMessage = '';
    successMessage = '';

    passwordVisible: boolean = false;
    passwordConfirmVisible: boolean = false;

    signupForm: FormGroup = this.fb.nonNullable.group({
        name: [
            '',
            [
                Validators.required,
                minLengthWithoutSpaces(3),
                Validators.pattern(/^[\p{L}\p{M}]+(?:[ '’-][\p{L}\p{M}]+)*$/u),
            ],
        ],
        email: [
            '',
            [
                Validators.required,
                Validators.email,
                Validators.pattern(/\.[a-zA-Z]{2,}$/),
                advancedEmailValidator(),
            ],
        ],
        password: [
            '',
            [
                Validators.required,
                Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^\w\s]).{8,}$/),
            ],
        ],
        confirmedPassword: ['', [Validators.required, passwordConfirm()]],
        acceptPolicy: ['', [Validators.required, Validators.requiredTrue]],
    });
    //#endregion

    constructor() {
        this.password?.valueChanges.subscribe(() => {
            this.confirmedPassword?.updateValueAndValidity();
        });
    }

    //#region methods
    //#region getter
    get name() {
        return this.signupForm.get('name');
    }

    get email() {
        return this.signupForm.get('email');
    }

    get password() {
        return this.signupForm.get('password');
    }

    get confirmedPassword() {
        return this.signupForm.get('confirmedPassword');
    }

    get acceptPolicy() {
        return this.signupForm.get('acceptPolicy');
    }
    //#endregion

    //#region password input
    // toggles password visibility on button klick
    toggleVisibility(inputElement: string) {
        const inputPassword: HTMLInputElement = document.getElementById(
            inputElement,
        ) as HTMLInputElement;

        if (inputPassword.type === 'password') {
            inputPassword.type = 'text';
        } else {
            inputPassword.type = 'password';
        }
        this.toggleBtnIcon(inputElement);
    }

    toggleBtnIcon(inputId: string) {
        if (inputId === 'password') {
            this.passwordVisible = !this.passwordVisible;
        } else if (inputId === 'confirmedPassword') {
            this.passwordConfirmVisible = !this.passwordConfirmVisible;
        }
    }
    //#endregion

    //#region submit
    async onSubmit(): Promise<void> {
        console.log(this.acceptPolicy?.errors);

        console.log('in method');
        console.log(this.signupForm.valid);

        this.signupForm.markAllAsTouched();
        this.errorMessage = '';
        this.successMessage = '';

        if (!this.signupForm.valid) {
            return;
        }

        this.loading = true;

        await this.signupUser();
    }

    async signupUser() {
        try {
            const { data, error } = await this.databaseService.signUp(
                this.email?.value,
                this.password?.value,
                this.name?.value,
            );

            if (error) {
                throw error;
            }

            // The database trigger has now created or connected the profile.
            // Force a reload so the shared profile list contains the new user.
            await this.profileService.ensureProfilesLoaded(true);

            if (data.session) {
                await this.router.navigate(['/summary']);
                return;
            }

            this.successMessage = 'Account added. ';
        } catch (error: unknown) {
            console.error('Error signing up:', error);
            this.successMessage = 'Account added. ';

            this.errorMessage = error instanceof Error ? error.message : 'Account error...';
        } finally {
            this.loading = false;
        }
    }
    //#endregion
    //#endregion
}
