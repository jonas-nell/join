import { Component, inject } from '@angular/core';
import { DialogService } from '../../dialog-service';
import { HeaderMenu } from './nav-bar/header-menu';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [HeaderMenu, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {

  dialogService = inject(DialogService);
}

