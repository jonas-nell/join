import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { Profile } from '../interfaces/profile';
import { ProfileService } from './profile-service';
import { ConfirmationService } from './confirmation-service';
import { NotificationService } from './notification-service';
import { DialogService } from './dialog-service';
import { DatabaseService } from './database-service';

@Injectable({
    providedIn: 'root',
})
export class ProfileDeletionService {
    private readonly profileService = inject(ProfileService);
    private readonly confirmationService = inject(ConfirmationService);
    private readonly notificationService = inject(NotificationService);
    private readonly dialogService = inject(DialogService);
    private readonly router = inject(Router);
    private readonly databaseService = inject(DatabaseService);

    readonly deleting = signal(false);

    async deleteProfile(profile: Profile): Promise<void> {
        const isOwnProfile = profile.id === this.databaseService.profileId();

        // Allow dummy profiles and the logged-in user's own profile to be deleted
        if (profile.user_role !== 'dummy' && !isOwnProfile) {
            this.notificationService.error(
                'You can only delete dummy profiles or your own profile.',
            );

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

            // await this.router.navigate(['/contacts']);

            if (isOwnProfile) {
                // The profile was deleted, now signout
                const { error } = await this.databaseService.signOut();

                if (error) {
                    this.notificationService.error(
                        'Profile deleted, but logout failed. Please log out manually.',
                    );
                    return;
                }

                await this.router.navigate(['/login']);
            } else {
                // Deleting a dummy profile keeps the current user logged in.
                await this.router.navigate(['/contacts']);
            }
        } catch (error) {
            console.error('The profile could not be deleted:', error);

            this.notificationService.error('The profile could not be deleted.');
        } finally {
            this.deleting.set(false);
        }
    }
}
