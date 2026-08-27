import { Injectable, signal } from '@angular/core';

export type NotificationType = 'success' | 'error';

@Injectable({
    providedIn: 'root',
})
export class NotificationService {
    readonly message = signal('');
    readonly type = signal<NotificationType>('success');

    private timeoutId: ReturnType<typeof setTimeout> | undefined;

    show(message: string, type: NotificationType): void {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }

        this.message.set(message);
        this.type.set(type);

        this.timeoutId = setTimeout(() => {
            this.message.set('');
        }, 3000);
    }

    success(message: string): void {
        this.show(message, 'success');
    }

    error(message: string): void {
        this.show(message, 'error');
    }
}