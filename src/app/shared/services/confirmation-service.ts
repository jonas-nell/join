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

    async confirmUnsavedChanges(
        formChanged: boolean,
        saveAction: () => Promise<void>,
        discardAction: () => void,
    ): Promise<void> {
        // No changes were made, so the dialog can close immediately.
        if (!formChanged) {
            discardAction();
            return;
        }

        // Wait for the user's answer.
        const shouldSave = await this.confirm('Save changes before closing?');

        // Run the correct function based on the user's answer.
        if (shouldSave) {
            await saveAction();
        } else {
            discardAction();
        }
    }
}
