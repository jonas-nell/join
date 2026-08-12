import { Component, effect, ElementRef, inject, input, viewChild } from '@angular/core';
import { DialogService } from '../../../dialog-service';
import { Dialog } from "../../../dialog-directive";

@Component({
  selector: 'app-header-menu',
  imports: [Dialog],
  templateUrl: './header-menu.html',
  styleUrl: './header-menu.scss',
})
export class HeaderMenu {
  // dialogService = inject(DialogService);

  // dialog = viewChild<ElementRef<HTMLDialogElement>>('dialog');

  // constructor() {
  //   effect(() => {
  //     const dialog = this.dialog()?.nativeElement;

  //     if (!dialog) {
  //       return;
  //     }

  //     if (this.dialogService.dialogOpen() == 'menu') {
  //       dialog.showModal();
  //     }

  //     if (this.dialogService.dialogOpen() != 'menu') {
  //       dialog.close();
  //     }
  //   });
  // }

  // onDialogClick(event: MouseEvent) {
  //   if (event.target === event.currentTarget) {
  //     this.dialogService.closeDialog();
  //   }
  // }
}
