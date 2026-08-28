import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter, map } from 'rxjs';

@Component({
    selector: 'app-nav-bar',
    imports: [RouterLink, RouterLinkActive],
    templateUrl: './nav-bar.html',
    styleUrl: './nav-bar.scss',
})
export class NavBar {
    private router = inject(Router);

    isBoardPage = toSignal(
        this.router.events.pipe(
            filter((e) => e instanceof NavigationEnd),
            map(() => this.router.url.startsWith('/board'))
        ),
        { initialValue: this.router.url.startsWith('/board') }
    );
}
