import { Directive, effect, ElementRef, HostListener, inject, input, signal } from '@angular/core';
import { DialogName, DialogService } from '../services/dialog-service';

@Directive({
    selector: 'dialog[appDialog]',
    host: {
        '(click)': 'onClickClose($event)',
    },
})
export class Dialog {
    dialogService = inject(DialogService);
    dialog = inject(ElementRef<HTMLDialogElement>);

    appDialog = input.required<DialogName>();
    modal = input<boolean>(true);

    closeOnBackdrop = input<boolean>(true);
    awaitData = signal<boolean>(true);

    constructor() {
        effect(() => {
            // nativeElement = referenz to host Element instance
            const dialog = this.dialog.nativeElement;
            const name = this.appDialog();

            if (this.dialogService.dialogOpen() == name) {
                this.modal() ? dialog.showModal() : dialog.show();
            } else {
                dialog.close();
            }
        });
    }

    onClickClose(event: MouseEvent): void {
        if (event.target === event.currentTarget && this.closeOnBackdrop()) {
            this.dialogService.closeDialog();
        }
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent) {
        if (this.modal()) return;
        if (!this.dialog.nativeElement.open) return;

        const target = event.target as Node;
        if (!this.dialog.nativeElement.contains(target)) {
            this.dialogService.closeDialog();
        }
    }
}
