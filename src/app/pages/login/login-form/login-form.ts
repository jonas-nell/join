import { Component } from '@angular/core';
import { DatabaseService } from '../../../shared/services/database-service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-login-form',
    imports: [FormsModule],
    templateUrl: './login-form.html',
    styleUrl: './login-form.scss',
})


export class LoginForm {
  email: string = '';
  password: string = '';

  constructor(private databaseService: DatabaseService, private router: Router) {}

  async onSubmit() {
    try {
      const { error } = await this.databaseService.signIn(this.email, this.password);
      if (error) throw error;
      this.router.navigate(['/board']);
    } catch (error) {
      console.error('Error logging in:', error);
    }
  }
}
