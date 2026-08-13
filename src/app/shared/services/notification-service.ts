import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class NotificationService {
    // Store the message that is currently visible.
    readonly message = signal('');

    private timeoutId: ReturnType<typeof setTimeout> | undefined;

    // Show a message for three seconds.
    show(message: string): void {
        // Stop the previous timer when another message is shown.
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }

        this.message.set(message);

        this.timeoutId = setTimeout(() => {
            this.message.set('');
        }, 3000);
    }
}