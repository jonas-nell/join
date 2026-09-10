import { Component, inject, signal, WritableSignal } from '@angular/core';
import { DatabaseService } from '../../../shared/services/database-service';
import { Router } from '@angular/router';
import {
    FormBuilder,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { SignupComponent } from '../signup-component/signup-component';
import { advancedEmailValidator } from '../../../shared/helpers/advancedEmailValidator';
import { LoginTransitionService } from '../../../shared/services/login-transition-service';

@Component({
    selector: 'app-login-form',
    imports: [FormsModule, SignupComponent, ReactiveFormsModule],
    templateUrl: './login-form.html',
    styleUrl: './login-form.scss',
})
export class LoginForm {
    //#region properties
    fb = inject(FormBuilder);
    databaseService = inject(DatabaseService);
    router = inject(Router);

    passwordVisible: boolean = false;
    errorMessage: WritableSignal<string | null> = signal(null);

    loginForm: FormGroup = this.fb.nonNullable.group({
        email: ['', [Validators.required]],
        password: ['', [Validators.required]],
    });
    //#endregion

    private loginTransition = inject(LoginTransitionService);

    constructor() {}

    //#region methods
    //#region getter
    get email() {
        return this.loginForm.get('email');
    }

    get password() {
        return this.loginForm.get('password');
    }
    //#endregion

    //#region submit
    async onSubmit() {
        this.loginForm.markAllAsTouched();
        if (!this.loginForm.valid) {
            return;
        }
        try {
            const { error } = await this.databaseService.signIn(
                this.email?.value,
                this.password?.value,
            );
            if (error) throw error;

            this.loginTransition.trigger();
            // this.databaseService.logIn.set(true);
            await this.router.navigate(['/summary'], {
                // avoid showing login with browser back click after login
                replaceUrl: true,
            });
        } catch (error) {
            this.errorMessage.set('Check your email and password. Please try again.');
            // console.error('Error logging in:', error);
        }
    }

    async loginAsGuest(): Promise<void> {
        try {
            const { error } = await this.databaseService.signInAsGuest();

            if (error) {
                throw error;
            }

            this.loginTransition.trigger();
            await this.router.navigate(['/summary'], {
                // avoid showing login with browser back click after login
                replaceUrl: true,
            });
        } catch (error) {
            this.errorMessage.set('Guest login failed');
            // console.error('Guest login failed:', error);
        }
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
        this.toggleBtnIcon();
    }

    toggleBtnIcon() {
        this.passwordVisible = !this.passwordVisible;
    }
    //#endregion
    //#endregion
}
