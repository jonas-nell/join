import { Directive, effect, ElementRef, inject, input } from '@angular/core';
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

  constructor() {

    // wird ausgeführt wenn sich der wert von dialogOpen() im service verändert
    effect(() => {

      // nativeElement = referenz zu host Element instanz
      const dialog = this.dialog.nativeElement;
      const name = this.appDialog();

      if (this.dialogService.dialogOpen() == name) {
        dialog.showModal();
      } else {
        dialog.close();
      }
    });
  }

  // dialog wird beim klick auf das element geschlossen. dazu zählt auch der backdrop
  // klick auf elemente im dialog schließen ihn nicht. daher darf der dialog kein padding haben, sondern nur die elemente darin
  // (falls nötig wrapper innerhalb von dialog nutzen)
  onClickClose(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.dialogService.closeDialog();
    }
  }
}
