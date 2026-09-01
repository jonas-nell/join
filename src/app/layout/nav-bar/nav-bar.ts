import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter, map } from 'rxjs';
import { Taskmanagement } from '../../shared/services/taskmanagement';

@Component({
    selector: 'app-nav-bar',
    imports: [RouterLink, RouterLinkActive],
    templateUrl: './nav-bar.html',
    styleUrl: './nav-bar.scss',
})
export class NavBar {
    private router = inject(Router);
    taskmanagement = inject(Taskmanagement);

    isBoardPage = toSignal(
        this.router.events.pipe(
            filter((e) => e instanceof NavigationEnd),
            map(() => this.router.url.startsWith('/board'))
        ),
        { initialValue: this.router.url.startsWith('/board') }
    );
}
