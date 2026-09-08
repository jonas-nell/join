import { Component } from '@angular/core';
import { DatabaseService } from '../../../shared/services/database-service';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProfileService } from '../../../shared/services/profile-service';

@Component({
    selector: 'app-signup-form',
    imports: [FormsModule, RouterLink],
    templateUrl: './signup-form.html',
    styleUrl: './signup-form.scss',
})
export class SignupForm {
    userName = '';
    email = '';
    password = '';
    passwordConfirmation = '';

    loading = false;
    errorMessage = '';
    successMessage = '';

    constructor(
        private databaseService: DatabaseService,
        private router: Router,
        private readonly profileService: ProfileService,
    ) {}

    async onSubmit(): Promise<void> {
        this.errorMessage = '';
        this.successMessage = '';

        if (this.password !== this.passwordConfirmation) {
            this.errorMessage = 'Passwords do not match....';
            return;
        }

        this.loading = true;

        try {
            const { data, error } = await this.databaseService.signUp(
                this.email,
                this.password,
                this.userName,
            );

            if (error) {
                throw error;
            }

            // The database trigger has now created or connected the profile.
            // Force a reload so the shared profile list contains the new user.
            await this.profileService.ensureProfilesLoaded(true);

            if (data.session) {
                await this.router.navigate(['/board']);
                return;
            }

            this.successMessage = 'Account added. ';
        } catch (error: unknown) {
            console.error('Error signing up:', error);

            this.errorMessage = error instanceof Error ? error.message : 'Account error...';
        } finally {
            this.loading = false;
        }
    }
}
