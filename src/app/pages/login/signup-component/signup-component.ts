import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DatabaseService } from '../../../shared/services/database-service';

@Component({
  selector: 'app-signup',
  imports: [FormsModule],
  templateUrl: './signup-component.html',
  styleUrl: './signup-component.scss',
})
export class SignupComponent {
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