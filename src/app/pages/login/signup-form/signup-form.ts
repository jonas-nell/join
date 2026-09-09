import { Component, effect, inject, signal, WritableSignal } from '@angular/core';
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
import { Dialog } from '../../../shared/directives/dialog-directive';
import { DialogService } from '../../../shared/services/dialog-service';
import { NotificationService } from '../../../shared/services/notification-service';

@Component({
    selector: 'app-signup-form',
    imports: [FormsModule, ReactiveFormsModule, RouterLink, Dialog],
    templateUrl: './signup-form.html',
    styleUrl: './signup-form.scss',
})
export class SignupForm {
    //#region properties
    databaseService = inject(DatabaseService);
    router = inject(Router);
    profileService = inject(ProfileService);
    dialogService = inject(DialogService);
    notificationService = inject(NotificationService);

    fb = inject(FormBuilder);

    loading = false;
    errorMessage = '';
    successMessage = '';
    errorInput: WritableSignal<string | null> = signal(null);

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
            this.notificationService.success('Account added');
            setTimeout(() => {

                this.router.navigate(['/login']);
            }, 1500)

            // The database trigger has now created or connected the profile.
            // Force a reload so the shared profile list contains the new user.
            // await this.databaseService.signOut();
        // await this.databaseService.client.auth.signOut({ scope: 'local' });

            
                
                
            

            this.successMessage = 'Account added. ';
        } catch (error: unknown) {
            // console.error('Error signing up:', error);
            // this.errorMessage = error instanceof Error ? error.message : 'Account error...';
            this.errorInput.set('This E-Mail-Adress is already registered');
        } finally {
            this.loading = false;
        }
    }
    //#endregion
    //#endregion
}
