import { Component, inject } from '@angular/core';
import { DialogService } from '../../dialog-service';
import { HeaderMenu } from './nav-bar/header-menu';
import { EditOrAddContact } from '../../shared/components/edit-or-add-contact/edit-or-add-contact';
@Component({
  selector: 'app-header',
  imports: [HeaderMenu, EditOrAddContact],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {

  dialogService = inject(DialogService);
}

