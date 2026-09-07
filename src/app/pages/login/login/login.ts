import { Component } from '@angular/core';
import { SignupComponent } from "../signup-component/signup-component";

@Component({
    selector: 'app-login',
    imports: [SignupComponent],
    templateUrl: './login.html',
    styleUrl: './login.scss',
})
export class Login {}
