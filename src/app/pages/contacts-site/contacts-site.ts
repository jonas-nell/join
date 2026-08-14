import { Component, inject, signal } from '@angular/core';
import { UserList } from '../../shared/components/user-list/user-list';
import { RouterLink, RouterOutlet } from '@angular/router';
import { ProfileService } from '../../shared/services/profile-service';
import { NotificationService } from '../../shared/services/notification-service';

@Component({
    selector: 'app-contacts-site',
    imports: [RouterLink, RouterOutlet, UserList],
    templateUrl: './contacts-site.html',
    styleUrl: './contacts-site.scss',
})
export class ContactsSite {
    // True when a profile route is open.
    readonly profileOpen = signal(false);

    // // Give the HTML access to shared notifications.
    // readonly profileService = inject(ProfileService);
    
    // Make global notifications available in the HTML.
    readonly notificationService = inject(NotificationService);

    onAddContact(){
        // open ad new contact dialog
    }

    onEditContact(){
        //open edit contact (currently open profile)
    }
}
