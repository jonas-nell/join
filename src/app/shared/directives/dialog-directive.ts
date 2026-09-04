import { Directive, effect, ElementRef, HostListener, inject, input, signal } from '@angular/core';
import { DialogName, DialogService } from '../services/dialog-service';

@Directive({
    // directive wird nur auf dialog elemente angewendet (mit dem attribut appDialog)
    selector: 'dialog[appDialog]',
    host: {
        '(click)': 'onClickClose($event)',
    },
})
export class Dialog {
    dialogService = inject(DialogService);
    dialog = inject(ElementRef<HTMLDialogElement>);

    // input gleichen namen wie directive selector geben, damit directive angewendet und gleichzeitig ein wert übergeben wird
    appDialog = input.required<DialogName>();
    modal = input<boolean>(true);

    // DAniel
    closeOnBackdrop = input<boolean>(true);
    awaitData = signal<boolean>(true);

    constructor() {
        // wird ausgeführt wenn sich der wert von dialogOpen() im service verändert
        effect(() => {
            // nativeElement = referenz zu host Element instanz
            const dialog = this.dialog.nativeElement;
            const name = this.appDialog();

            if (this.dialogService.dialogOpen() == name) {
                this.modal() ? dialog.showModal() : dialog.show();
            } else {
                dialog.close();
            }
        });
    }

    // dialog wird beim klick auf das element geschlossen. dazu zählt auch der backdrop
    // klick auf elemente im dialog schließen ihn nicht. daher darf der dialog kein padding haben, sondern nur die elemente darin
    // (falls nötig wrapper innerhalb von dialog nutzen)

    // Daniel

    // onClickClose(event: MouseEvent) {
    //   if (event.target === event.currentTarget) {
    //     this.dialogService.closeDialog();
    //   }
    // }

    onClickClose(event: MouseEvent): void {
        if (event.target === event.currentTarget && this.closeOnBackdrop()) {
            // console.log(this.dialogService.backdropEvent());

            // this.dialogService.backdropEvent.set(true);
            this.dialogService.closeDialog();
        }
    }

    // @HostListener('document:click', ['$event'])
    // onDocumentClick(event: MouseEvent) {
    //     if (this.modal()) return;
    //     if (!this.dialog.nativeElement.open) return;

    //     const target = event.target as Node;
    //     if (!this.dialog.nativeElement.contains(target)) {
    //         this.dialogService.closeDialog();
    //     }
    // }
}
