import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { NavigationHistoryService } from '../../services/navigation-history.service';

const SECONDARY_ROUTES = ['/help', '/legal-notice', '/privacy-policy'];

@Component({
    selector: 'app-back-button',
    imports: [],
    templateUrl: './back-button.html',
    styleUrl: './back-button.scss',
})
export class BackButton {
    constructor (private location: Location, private router: Router, private navHistory: NavigationHistoryService) {
    }

    goBack(): void {
        const currentUrl = this.router.url;
        const isSecondaryPage = SECONDARY_ROUTES.some((route) => currentUrl.startsWith(route));
        
        if (isSecondaryPage) {
            this.router.navigateByUrl(this.navHistory.getLastMainRoute());
            return;
        }

        if (window.history.length > 1) {
            this.location.back();
        } else {
            this.router.navigate(['/']);
        }
    }
}
