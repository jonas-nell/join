import { Component, inject } from '@angular/core';
import { DatabaseService } from '../../../shared/services/database-service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SignupComponent } from "../signup-component/signup-component";
import { LoginTransitionService } from '../../../shared/services/login-transition-service';

@Component({
    selector: 'app-login-form',
    imports: [FormsModule, SignupComponent],
    templateUrl: './login-form.html',
    styleUrl: './login-form.scss',
})
export class LoginForm {
    email: string = '';
    password: string = '';

    private loginTransition = inject(LoginTransitionService);

    constructor(
        private databaseService: DatabaseService,
        private router: Router,
    ) {}

    async onSubmit() {
        try {
            const { error } = await this.databaseService.signIn(this.email, this.password);
            if (error) throw error;

            this.loginTransition.trigger();
            this.router.navigate(['/summary']);
        } catch (error) {
            console.error('Error logging in:', error);
        }
    }

    async loginAsGuest(): Promise<void> {
        try {
            const { error } = await this.databaseService.signInAsGuest();

            if (error) {
                throw error;
            }

            this.loginTransition.trigger();
            await this.router.navigate(['/summary']);
        } catch (error) {
            console.error('Guest login failed:', error);
        }
    }
}
