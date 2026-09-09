import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
    selector: 'app-signup-component',
    imports: [RouterLink, RouterLinkActive],
    templateUrl: './signup-component.html',
    styleUrl: './signup-component.scss',
})
export class SignupComponent {}
