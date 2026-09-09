import { Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';

import { NavBar } from './layout/nav-bar/nav-bar';
import { Header } from './layout/header/header';
import { HeaderPublic } from './layout/header-public/header-public';
import { Footer } from './layout/footer/footer';
import { NavigationHistoryService } from './shared/services/navigation-history.service';
import { Notification } from './shared/components/notification/notification/notification';
import { DatabaseService } from './shared/services/database-service';
import { LayoutService } from './shared/services/layout-service';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, NavBar, Header, Notification, HeaderPublic, Footer],
    templateUrl: './app.html',
    styleUrl: './app.scss',
})
export class App {
    protected readonly title = signal('join');

    readonly database = inject(DatabaseService);
    private readonly router = inject(Router);
    readonly layoutService = inject(LayoutService);

    // used to display the standard navbar even when the user
// is not authenticated.
    isLegalPage(): boolean {
    return (
      this.router.url.startsWith('/privacy-policy') ||
      this.router.url.startsWith('/legal-notice')
    );
  }

    // Inject on startup so the first NavigationEnd event isn't missed.
    constructor(private navHistory: NavigationHistoryService) {}
}
