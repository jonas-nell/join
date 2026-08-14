import { Component, inject, signal } from '@angular/core';
import { UserList } from './user-list/user-list';
import { RouterOutlet } from '@angular/router';
import { NotificationService } from '../../shared/services/notification-service';
import { BackButton } from '../../shared/components/back-button/back-button';

@Component({
    selector: 'app-contacts-site',
    imports: [RouterOutlet, UserList, BackButton],
    templateUrl: './contacts-site.html',
    styleUrl: './contacts-site.scss',
})
export class ContactsSite {
    // True when a profile route is open.
    readonly profileOpen = signal(false);
    
    // Make global notifications available in the HTML.
    readonly notificationService = inject(NotificationService);

    onAddContact(){
        // open ad new contact dialog
    }

    onEditContact(){
        //open edit/delete thing --> edit/delte based (currently open profile)
    }
}
