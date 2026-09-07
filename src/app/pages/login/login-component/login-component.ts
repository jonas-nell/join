import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DatabaseService } from '../../../shared/services/database-service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login-component.html',
    styleUrl: './login-component.scss',
})
export class LoginComponent {
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