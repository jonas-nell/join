import { Component, inject, signal } from '@angular/core';
import { Dialog } from '../../../dialog-directive';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { minLengthWithoutSpaces } from '../../../shared/helpers/function-min-length';

@Component({
    selector: 'app-edit-or-add-contact',
    imports: [Dialog, ReactiveFormsModule],
    templateUrl: './edit-or-add-contact.html',
    styleUrl: './edit-or-add-contact.scss',
})
export class EditOrAddContact {
    fb = inject(FormBuilder);

    // bei klick auf edit button auf true, bei klick auf new contact auf false
    edit= signal(false);

    contactForm = this.fb.group({
        name: ['', [Validators.required, minLengthWithoutSpaces(3), Validators.pattern(/^[\p{L}\p{M}]+(?:[ '’-][\p{L}\p{M}]+)*$/u)]],
        email: ['', [Validators.required, Validators.email]],
        phone: [0, [Validators.required, minLengthWithoutSpaces(10), Validators.pattern(/^\+?[0-9]+$/)]],
    });

    get name(){
        return this.contactForm.get('name');
    }

    get email(){
        return this.contactForm.get('email')
    }

    get phone(){
        return this.contactForm.get('phone')
    }

    // beim öffnen daten des zu bearbeitenden contacts einfügen
    // ### Daniel: zugewisene daten mit denen von der datenbank austauschen
    // ### Jonas: funktion aufrufen wenn button edit angeklickt oder effect erstellen der auf änderung des übergebenen parameters hört
    fillEditForm(){
        if (this.edit()) {
            this.contactForm.setValue({
                name: 'hans',
                email: 'hans@email',
                phone: 123456789
            })            
        }
    }

    // ### Daniel:Daten an Datenbank schicken
    formSubmit() {
        if (this.contactForm.valid) {
            console.log(this.contactForm.value);
            this.contactForm.reset();
        } else {
            this.contactForm.markAllAsTouched();
        }
    }
}
