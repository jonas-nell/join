import { Component, inject, signal } from '@angular/core';
import { UserList } from './user-list/user-list';
import { RouterOutlet } from '@angular/router';
import { NotificationService } from '../../shared/services/notification-service';
import { BackButton } from '../../shared/components/back-button/back-button';
import { EditOrAddContact } from "./edit-or-add-contact/edit-or-add-contact";
import { DialogService } from '../../shared/services/dialog-service';
import { Dialog } from "../../shared/directives/dialog-directive";
import { ProfileService } from '../../shared/services/profile-service';
import { DeleteProfile } from "../../shared/components/delete-profile/delete-profile";

@Component({
    selector: 'app-contacts-site',
    imports: [RouterOutlet, UserList, BackButton, EditOrAddContact, Dialog, DeleteProfile],
    templateUrl: './contacts-site.html',
    styleUrl: './contacts-site.scss',
})
export class ContactsSite {
    // True when a profile route is open.
    readonly profileOpen = signal(false);
    
    // Make global notifications available in the HTML.
    readonly notificationService = inject(NotificationService);

    readonly profileService = inject(ProfileService);

    dialogservice = inject(DialogService);

    constructor() {
        void this.profileService.ensureProfilesLoaded();
    }

    onAddContact(){
        this.dialogservice.openDialog('edit-and-add-contact', 'add');
    }

    onEditContact(){
        this.dialogservice.openDialog('contact-btn-dialog');
    }
}
