import { Component, inject } from '@angular/core';
import { DialogService } from '../../shared/services/dialog-service';
import { HeaderMenu } from './nav-bar/header-menu';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';

@Component({
  selector: 'app-header',
  imports: [HeaderMenu, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {

  dialogService = inject(DialogService);
  private router = inject(Router);

  isBoardPage = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(() => this.router.url.startsWith('/board'))
    ),
    { initialValue: this.router.url.startsWith('/board') }
  );
}

