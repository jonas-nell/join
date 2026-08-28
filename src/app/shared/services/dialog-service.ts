import { Injectable, Service, signal } from '@angular/core';

// beim erstellen von weiteren dialogs namen hinzufügen
export type DialogName = 'menu' | 'edit-and-add-contact' | 'contact-btn-dialog' | `move-menu-${number}`;
export type DialogMode = 'edit' | 'add';

@Injectable({ providedIn: 'root' })
export class DialogService {
    dialogOpen = signal<DialogName | null>(null);
    dialogMode = signal<DialogMode | null>(null);

    openDialog(name: DialogName, mode: DialogMode | null = null) {
        this.dialogMode.set(mode);
        this.dialogOpen.set(name);   
    }

    closeDialog(){
        this.dialogOpen.set(null);
        this.dialogMode.set(null);
        
    }
}
