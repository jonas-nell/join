import { Component } from '@angular/core';
import { DatabaseService } from '../../../shared/services/database-service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SignupComponent } from "../signup-component/signup-component";

@Component({
    selector: 'app-login-form',
    imports: [FormsModule, SignupComponent],
    templateUrl: './login-form.html',
    styleUrl: './login-form.scss',
})
export class LoginForm {
    email: string = '';
    password: string = '';

    constructor(
        private databaseService: DatabaseService,
        private router: Router,
    ) {}

    async onSubmit() {
        try {
            const { error } = await this.databaseService.signIn(this.email, this.password);
            if (error) throw error;
            this.router.navigate(['/board']);
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

            await this.router.navigate(['/board']);
        } catch (error) {
            console.error('Guest login failed:', error);
        }
    }
}
