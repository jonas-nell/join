import { Service, signal } from '@angular/core';

// beim erstellen von weiteren dialogs namen hinzufügen
export type DialogName = 'menu';

@Service()
export class DialogService {
    dialogOpen = signal<DialogName | null>(null);

    openDialog(name: DialogName) {
        this.dialogOpen.set(name);
    }

    closeDialog(){
        this.dialogOpen.set(null);
    }
}
