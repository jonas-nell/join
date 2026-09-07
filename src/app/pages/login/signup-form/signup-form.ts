import { Component } from '@angular/core';
import { DatabaseService } from '../../../shared/services/database-service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-signup-form',
    imports: [FormsModule],
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

      if (data.session) {
        await this.router.navigate(['/board']);
        return;
      }

      this.successMessage =
        'Account added. Please confirm your E-Mail-adddress.';
    } catch (error: unknown) {
      console.error('Error signing up:', error);

      this.errorMessage =
        error instanceof Error
          ? error.message
          : 'Account error...';
    } finally {
      this.loading = false;
    }
  }
}
