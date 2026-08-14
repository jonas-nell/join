import { Component, inject } from '@angular/core';
import { DialogService } from '../../dialog-service';
import { HeaderMenu } from './nav-bar/header-menu';

@Component({
  selector: 'app-header',
  imports: [HeaderMenu,],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {

  dialogService = inject(DialogService);
}

