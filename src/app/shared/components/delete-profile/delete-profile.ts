import { Component, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';

import { Profile } from '../../interfaces/profile';
import { ProfileService } from '../../services/profile-service';
import { NotificationService } from '../../services/notification-service';

@Component({
    selector: 'app-delete-profile',
    standalone: true,
    templateUrl: './delete-profile.html',
    styleUrl: './delete-profile.scss',
})
export class DeleteProfile {
    private readonly profileService = inject(ProfileService);
    private readonly router = inject(Router);
    private readonly notificationService = inject(NotificationService);

    // Receive the profile from the parent component.
    readonly profile = input.required<Profile>();

    // Choose which button design should be used.
    readonly buttonStyle = input<'profile' | 'edit'>('profile');

    // True while the confirmation popup is visible.
    readonly confirmationOpen = signal(false);

    // True while Angular is waiting for Supabase.
    readonly deleting = signal(false);

    // Store an error message for the popup.
    readonly errorMessage = signal('');

    // Check the profile before opening the confirmation popup.
    openConfirmation(): void {
        const selectedProfile = this.profile();

        // Only dummy profiles can be deleted.
        if (selectedProfile.user_role !== 'dummy') {
            this.errorMessage.set('Only dummy profiles can be deleted.');

            return;
        }

        this.confirmationOpen.set(true);
    }

    // Close the confirmation without deleting the profile.
    closeConfirmation(): void {
        this.confirmationOpen.set(false);
    }

    // Close the error popup.
    closeError(): void {
        this.errorMessage.set('');
    }

    // Delete the profile after the user confirms it.
    async confirmDeletion(): Promise<void> {
        const selectedProfile = this.profile();

        this.confirmationOpen.set(false);
        this.deleting.set(true);
        this.errorMessage.set('');

        try {
            // Delete the profile from Supabase.
            await this.profileService.deleteDummyProfile(selectedProfile.id);

            // Show the success notification.
            this.notificationService.show(`${selectedProfile.user_name} was deleted.`);
            
            // Return to the normal Contacts view.
            await this.router.navigate(['/contacts']);
        } catch (error) {
            console.error('The profile could not be deleted:', error);

            this.errorMessage.set('The profile could not be deleted.');
        } finally {
            // The delete request has finished.
            this.deleting.set(false);
        }
    }
}
