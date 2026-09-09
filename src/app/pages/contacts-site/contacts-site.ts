import { Component, inject, OnInit, signal } from '@angular/core';
import { UserList } from './user-list/user-list';
import { RouterOutlet } from '@angular/router';
import { NotificationService } from '../../shared/services/notification-service';
import { BackButton } from '../../shared/components/back-button/back-button';
import { EditOrAddContact } from './edit-or-add-contact/edit-or-add-contact';
import { DialogService } from '../../shared/services/dialog-service';
import { Dialog } from '../../shared/directives/dialog-directive';
import { ProfileService } from '../../shared/services/profile-service';
// import { DeleteProfile } from "../../shared/components/delete-profile/delete-profile";
import { ProfileDeletionService } from '../../shared/services/profile-deletion-service';
import { ConfirmationDialog } from '../../shared/components/confirmation/confirmation/confirmation';
import { Profile } from '../../shared/interfaces/profile';
import { LayoutService } from '../../shared/services/layout-service';

@Component({
    selector: 'app-contacts-site',
    imports: [RouterOutlet, UserList, BackButton, EditOrAddContact, Dialog, ConfirmationDialog],
    templateUrl: './contacts-site.html',
    styleUrl: './contacts-site.scss',
})
export class ContactsSite implements OnInit{
    // True when a profile route is open.
    readonly profileOpen = signal(false);

    // Make global notifications available in the HTML.
    readonly notificationService = inject(NotificationService);
    readonly profileDeletion = inject(ProfileDeletionService);
    readonly profileService = inject(ProfileService);
    readonly layoutService = inject(LayoutService);

    dialogservice = inject(DialogService);

    constructor() {
        void this.profileService.ensureProfilesLoaded();
    }

    onAddContact() {
        this.dialogservice.openDialog('edit-and-add-contact', 'add');
    }

    onEditContact() {
        this.dialogservice.openDialog('contact-btn-dialog');
    }

    async deleteFromMenu(profile: Profile): Promise<void> {
        this.dialogservice.closeDialog();
        await this.profileDeletion.deleteProfile(profile);
    }

    ngOnInit(){
        this.layoutService.mainBackground.set('white');
    }

    ngOnDestroy(){
        this.layoutService.mainBackground.set('#F6F7F8');
    }


}
