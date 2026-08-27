import { Component, effect, inject } from '@angular/core';
import { Dialog } from '../../../shared/directives/dialog-directive';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { minLengthWithoutSpaces } from '../../../shared/helpers/function-min-length';
import { DialogService } from '../../../shared/services/dialog-service';
import { ProfileService } from '../../../shared/services/profile-service';
import { DeleteProfile } from "../../../shared/components/delete-profile/delete-profile";
import { NotificationService } from '../../../shared/services/notification-service';
import { ProfileChanges } from '../../../shared/interfaces/profile';
import { UserBadge } from "../../../shared/components/user-badge/user-badge";
import { Router } from '@angular/router';
import { advancedEmailValidator } from '../../../shared/helpers/advancedEmailValidator';

@Component({
    selector: 'app-edit-or-add-contact',
    imports: [Dialog, ReactiveFormsModule, DeleteProfile, UserBadge],
    templateUrl: './edit-or-add-contact.html',
    styleUrl: './edit-or-add-contact.scss',
})
export class EditOrAddContact {
    fb = inject(FormBuilder);
    dialogService = inject(DialogService);
    private readonly router = inject(Router);

    readonly profileService = inject(ProfileService);
    readonly notificationService = inject(NotificationService);

    contactForm = this.fb.nonNullable.group({
        name: ['', [Validators.required, minLengthWithoutSpaces(2), Validators.pattern(/^[\p{L}\p{M}]+(?:[ '’-][\p{L}\p{M}]+)*$/u)]],
        email: ['', [Validators.required, Validators.email, Validators.pattern(/\.[a-zA-Z]{2,}$/), advancedEmailValidator()]],
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

    async formSubmit() {
        this.contactForm.patchValue({
            name: (this.name?.value ?? '').replace(/^\s+|\s+$/g, ''),
            email: (this.email?.value ?? '').replace(/\s+/g, ''),
            phone: (this.phone?.value ?? '').replace(/\s+/g, ''),
        });

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
                this.notificationService.success(`${updated.user_name} was updated`);
            } else {
                const created = await this.profileService.createProfile(changes);
                this.profileService.scrollToNewContact.set(created.id);
                this.notificationService.success(`${created.user_name} was created`);
                void this.router.navigate(['/contacts', created.id]);
            }

            this.dialogService.closeDialog();
        } catch (error) {
            this.notificationService.error('The contact could not be saved. Please try again.');
        }
    }
}