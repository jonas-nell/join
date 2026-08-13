import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

const MAIN_ROUTES = ['/summary', '/tasks', '/board', '/contacts'];

// CHANGE THIS TO /summary !!!!! (once site exists)
const DEFAULT_MAIN_ROUTE = '/contacts';

@Injectable({ providedIn: 'root' })
export class NavigationHistoryService {
    private lastMainRoute = DEFAULT_MAIN_ROUTE;

    constructor(private router: Router) {
        this.router.events
            .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
            .subscribe((event) => {
                if (MAIN_ROUTES.some((route) => event.urlAfterRedirects.startsWith(route))) {
                    this.lastMainRoute = event.urlAfterRedirects;
                }
            });
    }

    getLastMainRoute(): string {
        return this.lastMainRoute;
    }
}
