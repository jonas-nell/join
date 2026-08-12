import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

@Component({
    selector: 'app-back-button',
    imports: [],
    templateUrl: './back-button.html',
    styleUrl: './back-button.scss',
})
export class BackButton {
    constructor (private location: Location, private router: Router) {
    }

    goBack(): void {
        if (window.history.length > 1) {
            this.location.back();
        } else {
            this.router.navigate(['/']);
        }
    }
}
