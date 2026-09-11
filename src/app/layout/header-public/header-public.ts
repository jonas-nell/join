import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SignupComponent } from '../../pages/login/signup-component/signup-component';

@Component({
    selector: 'app-header-public',
    imports: [SignupComponent],
    templateUrl: './header-public.html',
    styleUrl: './header-public.scss',
})
export class HeaderPublic {
    private router = inject(Router);

    openSignUpForm(): void {
        this.router.navigate(['/signup']);
    }
}
