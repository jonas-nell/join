import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root',
})

export class ConfirmationService {
    readonly message = signal('');

    private answerDialog?: (answer: boolean) => void;

    confirm(message: string): Promise<boolean> {
        this.message.set(message);

        return new Promise<boolean>((resolve) => {
            this.answerDialog = resolve;
        });
    }

    answer(answer: boolean): void {
        this.answerDialog?.(answer);
        this.message.set('');
        this.answerDialog = undefined;
    }
}