import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Profile } from '../../interfaces/profile';
import { createProfileColor, createProfileInitials } from '../../helpers/profile-helper';
import { ProfileService } from '../../services/profile-service';
import { DeleteProfile } from '../delete-profile/delete-profile';

@Component({
    selector: 'app-user-profile',
    standalone: true,
    imports: [DeleteProfile],
    templateUrl: './user-profile.html',
    styleUrl: './user-profile.scss',
})
export class UserProfile implements OnInit {
    private readonly route = inject(ActivatedRoute);

    // Router lets Angular return to the normal Contacts view.
    // private readonly router = inject(Router);

    private readonly profileService = inject(ProfileService);

    // Store the selected profile.
    readonly profile = signal<Profile | null>(null);

    // Show a message while the profile is loading.
    readonly loading = signal(true);

    // Store an error message when loading fails.
    readonly errorMessage = signal('');

    // True while Supabase is deleting the profile.
    // readonly deleting = signal(false);

    // // True while the delete confirmation popup is open.
    // readonly showDeleteConfirmation = signal(false);

    // // Store a message for a simple information popup.
    // readonly popupMessage = signal('');

    // Make the profile helpers available in the HTML...
    readonly getProfileColor = createProfileColor;
    readonly getInitials = createProfileInitials;

    ngOnInit(): void {
        // Listen for changes to the ID in the URL.
        this.route.paramMap.subscribe((parameters) => {
            const profileId = parameters.get('id');

            // Stop when the URL does not contain an ID.
            if (!profileId) {
                this.errorMessage.set('No profile ID was found.');

                this.loading.set(false);
                return;
            }

            // Load the profile that belongs to the URL ID.
            void this.loadProfile(profileId);
        });
    }

    // Load one profile from Supabase.
    async loadProfile(profileId: string): Promise<void> {
        this.loading.set(true);
        this.errorMessage.set('');

        try {
            const profile = await this.profileService.getProfileById(profileId);

            // Show an error when the profile does not exist.
            if (!profile) {
                this.profile.set(null);

                this.errorMessage.set('The profile was not found.');

                return;
            }

            // Save the loaded profile.
            this.profile.set(profile);
        } catch (error) {
            console.error(error);

            this.profile.set(null);

            this.errorMessage.set('The profile could not be loaded.');
        } finally {
            // Stop the loading message.
            this.loading.set(false);
        }
    }

    // // Delete the selected dummy after confirmation.
    // async deleteSelectedProfile(): Promise<void> {
    //     const selectedProfile = this.profile();

    //     // Stop when no profile is loaded.
    //     if (!selectedProfile) {
    //         return;
    //     }

    //     // Close the confirmation popup.
    //     this.showDeleteConfirmation.set(false);

    //     this.deleting.set(true);
    //     this.errorMessage.set('');

    //     try {
    //         // Remember the name before closing the profile.
    //         const deletedName = selectedProfile.user_name;

    //         // Delete the dummy from Supabase.
    //         await this.supabaseService.deleteDummyProfile(selectedProfile.id);

    //         // Show the success notification.
    //         this.supabaseService.showNotification(`${deletedName} was deleted.`);

    //         // Return to the normal Contacts view.
    //         await this.router.navigate(['/contacts']);
    //     } catch (error) {
    //         console.error('The profile could not be deleted:', error);

    //         this.popupMessage.set('The profile could not be deleted.');
    //     } finally {
    //         // The delete request has finished.
    //         this.deleting.set(false);
    //     }
    // }

    // // Open the Delete popup.
    // openDeleteConfirmation(): void {
    //     const selectedProfile = this.profile();

    //     // Stop when no profile is loaded.
    //     if (!selectedProfile) {
    //         return;
    //     }

    //     // Normal users cannot be deleted with this button.
    //     if (selectedProfile.user_role !== 'dummy') {
    //         this.popupMessage.set('Only dummy profiles can be deleted.');

    //         return;
    //     }

    //     // Show the Yes/No confirmation popup.
    //     this.showDeleteConfirmation.set(true);
    // }

    // // Close the Delete popup without deleting anything.
    // closeDeleteConfirmation(): void {
    //     this.showDeleteConfirmation.set(false);
    // }

    // // Close the information popup.
    // closePopupMessage(): void {
    //     this.popupMessage.set('');
    // }
}
