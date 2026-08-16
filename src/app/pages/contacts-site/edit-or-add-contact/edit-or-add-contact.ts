import { Component, effect, inject } from '@angular/core';
import { Dialog } from '../../../dialog-directive';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { minLengthWithoutSpaces } from '../../../shared/helpers/function-min-length';
import { DialogService } from '../../../dialog-service';
import { ProfileService } from '../../../shared/services/profile-service';
import { DeleteProfile } from "../../../shared/components/delete-profile/delete-profile";
import { NotificationService } from '../../../shared/services/notification-service';
import { ProfileChanges } from '../../../shared/interfaces/profile';
import { UserBadge } from "../../../shared/components/user-badge/user-badge";

@Component({
    selector: 'app-edit-or-add-contact',
    imports: [Dialog, ReactiveFormsModule, DeleteProfile, UserBadge],
    templateUrl: './edit-or-add-contact.html',
    styleUrl: './edit-or-add-contact.scss',
})
export class EditOrAddContact {
    fb = inject(FormBuilder);
    dialogService = inject(DialogService);

    readonly profileService = inject(ProfileService);
    readonly notificationService = inject(NotificationService);

    contactForm = this.fb.nonNullable.group({
        name: ['', [Validators.required, minLengthWithoutSpaces(3), Validators.pattern(/^[\p{L}\p{M}]+(?:[ '’-][\p{L}\p{M}]+)*$/u)]],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', [Validators.required, minLengthWithoutSpaces(8), Validators.pattern(/^\+?[0-9 ]+$/)]],
    });

    constructor(){
        effect(() => {
            const isThisDialogOpen = this.dialogService.dialogOpen() === 'edit-and-add-contact';

            if (isThisDialogOpen) {
                this.fillEditForm();
            } else {
                this.contactForm.reset();
            }
        });
    }

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
    fillEditForm(){
        if (this.dialogService.dialogMode() == 'edit') {
            const selected = this.profileService.selectedProfile();

            if (!selected) {
                return;
            }

            this.contactForm.setValue({
                name: selected.user_name,
                email: selected.user_email,
                phone: selected.user_phone ?? '',
            });            
        }
    }

    // ### Daniel:Daten an Datenbank schicken
    async formSubmit() {
        if (!this.contactForm.valid) {
            this.contactForm.markAllAsTouched();
            return;
        }

        const values = this.contactForm.getRawValue();
        const changes: ProfileChanges = {
            user_name: values.name,
            user_email: values.email,
            user_phone: values.phone || null,
        };
        

        try {
            if (this.dialogService.dialogMode() === 'edit') {
                const selected = this.profileService.selectedProfile();

                if (!selected) {
                    return;
                }

                const updated = await this.profileService.updateProfile(selected.id, changes);
                this.profileService.selectedProfile.set(updated);
                this.notificationService.show(`${updated.user_name} was updated`);
            } else {
                const created = await this.profileService.createProfile(changes);
                this.notificationService.show(`${created.user_name} was created`);
            }

            this.dialogService.closeDialog();
        } catch (error) {
            this.notificationService.show('The contact could not be saved. Please try again.');
        }
    }
}