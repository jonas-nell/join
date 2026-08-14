import { Service, signal } from '@angular/core';

// beim erstellen von weiteren dialogs namen hinzufügen
export type DialogName = 'menu' | 'edit-and-add-contact';
export type DialogMode = 'edit' | 'add';

@Service()
export class DialogService {
    dialogOpen = signal<DialogName | null>(null);
    dialogMode = signal<DialogMode | null>(null);

    openDialog(name: DialogName, mode: DialogMode | null) {
        this.dialogMode.set(mode);
        this.dialogOpen.set(name);   
    }

    closeDialog(){
        this.dialogOpen.set(null);
        this.dialogMode.set(null);
    }
}
