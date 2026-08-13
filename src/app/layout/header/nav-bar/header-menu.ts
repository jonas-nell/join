import { Component, effect, ElementRef, inject, input, viewChild } from '@angular/core';
import { DialogService } from '../../../dialog-service';
import { Dialog } from '../../../dialog-directive';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
    selector: 'app-header-menu',
    imports: [Dialog, RouterLink, RouterLinkActive],
    templateUrl: './header-menu.html',
    styleUrl: './header-menu.scss',
})
export class HeaderMenu {
    dialogservice = inject(DialogService);
}
