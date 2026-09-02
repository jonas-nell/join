import {
    Component,
    effect,
    ElementRef,
    inject,
    viewChild,
} from '@angular/core';

import { NotificationService } from '../../../services/notification-service';

@Component({
    selector: 'app-notification',
    templateUrl: './notification.html',
    styleUrl: './notification.scss',
})
export class Notification {
    readonly notificationService = inject(NotificationService);

    private readonly notification =
        viewChild<ElementRef<HTMLElement>>('notification');

    constructor() {
        effect(() => {
            const message = this.notificationService.message();
            const element = this.notification()?.nativeElement;

            if (!element) {
                return;
            }

            if (message) {
                if (!element.matches(':popover-open')) {
                    element.showPopover();
                }

                return;
            }

            if (element.matches(':popover-open')) {
                element.hidePopover();
            }
        });
    }
}