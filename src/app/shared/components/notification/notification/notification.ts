import { Component, inject } from '@angular/core';
import { NotificationService } from '../../../services/notification-service';


@Component({
    selector: 'app-notification',
    templateUrl: './notification.html',
    styleUrl: './notification.scss',
})
export class Notification {
    readonly notificationService = inject(NotificationService);
}