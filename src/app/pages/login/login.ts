import { Component } from '@angular/core';
import { LoginForm } from "./login-form/login-form";
import { SignupForm } from './signup-form/signup-form';

@Component({
    selector: 'app-login',
    imports: [LoginForm, SignupForm],
    templateUrl: './login.html',
    styleUrl: './login.scss',
})
export class Login {}
