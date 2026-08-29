import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { Profile } from '../interfaces/profile';
import { ProfileService } from './profile-service';
import { ConfirmationService } from './confirmation-service';
import { NotificationService } from './notification-service';
import { DialogService } from './dialog-service';

@Injectable({
    providedIn: 'root',
})
export class ProfileDeletionService {
    private readonly profileService = inject(ProfileService);
    private readonly confirmationService = inject(ConfirmationService);
    private readonly notificationService = inject(NotificationService);
    private readonly dialogService = inject(DialogService);
    private readonly router = inject(Router);

    readonly deleting = signal(false);

    async deleteProfile(profile: Profile): Promise<void> {
        if (profile.user_role !== 'dummy') {
            this.notificationService.error('Only dummy profiles can be deleted.');

            return;
        }

        const confirmed = await this.confirmationService.confirm(
            `Do you really want to delete ${profile.user_name}?`,
        );

        if (!confirmed) {
            return;
        }

        this.deleting.set(true);

        try {
            await this.profileService.deleteProfile(profile.id);

            this.notificationService.success(`${profile.user_name} was deleted.`);

            this.dialogService.closeDialog();

            await this.router.navigate(['/contacts']);
        } catch (error) {
            console.error('The profile could not be deleted:', error);

            this.notificationService.error('The profile could not be deleted.');
        } finally {
            this.deleting.set(false);
        }
    }
}
