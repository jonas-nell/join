import { Component, OnInit, effect, inject, signal, computed } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Profile } from '../../../shared/interfaces/profile';
// import { createProfileColor, createProfileInitials } from '../../../shared/helpers/profile-helper';
import { ProfileService } from '../../../shared/services/profile-service';
import { DeleteProfile } from '../../../shared/components/delete-profile/delete-profile';
import { UserBadge } from '../../../shared/components/user-badge/user-badge';
import { DialogService } from '../../../shared/services/dialog-service';
import { retry } from 'rxjs';


@Component({
    selector: 'app-user-profile',
    standalone: true,
    imports: [DeleteProfile, UserBadge],
    templateUrl: './user-profile.html',
    styleUrl: './user-profile.scss',
})
export class UserProfile implements OnInit {
    private readonly route = inject(ActivatedRoute);

    private readonly profileService = inject(ProfileService);

    // // Store the selected profile.
    // readonly profile = signal<Profile | null>(null);

    private readonly profileId = signal<string | null>(null);
    // Show a message while the profile is loading.
    // readonly loading = signal(true);

    // Store an error message when loading fails.
    // readonly errorMessage = signal('');

    readonly profile = computed(() => {
        const id = this.profileId();

        return id ? this.profileService.getCachedProfileById(id) ?? null : null;
    })

    readonly profileList = computed(() => {
        const selectedProfile = this.profile();
        return selectedProfile ? [selectedProfile] : [];
    });

    readonly loading = signal(true);

    readonly errorMessage = signal('');

    // Make the profile helpers available in the HTML...
    // readonly getProfileColor = createProfileColor;
    // readonly getInitials = createProfileInitials;

    dialogservice = inject(DialogService);

    constructor() {
        effect(() => {
            this.profileService.selectedProfile.set(this.profile());
        });
    }

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
            void this.showProfile(profileId);
        });
    }

    private async showProfile(profileId: string): Promise<void> {
        this.errorMessage.set('');

        if (this.profileService.getCachedProfileById(profileId)) {
            this.profileId.set(profileId);
            this.loading.set(false);
            return;
        }

        this.loading.set(true);
        await this.profileService.ensureProfilesLoaded();
        this.loading.set(false);

        if (!this.profileService.getCachedProfileById(profileId)) {
            this.errorMessage.set('The profile was not found');
            this.profileId.set(null);
            return;
        }

        this.profileId.set(profileId);
    }

    // // Load one profile from Supabase.
    // async loadProfile(profileId: string): Promise<void> {
    //     this.loading.set(true);
    //     this.errorMessage.set('');

    //     try {
    //         const profile = await this.profileService.getProfileById(profileId);

    //         // Show an error when the profile does not exist.
    //         if (!profile) {
    //             this.profile.set(null);
    //             this.profileService.selectedProfile.set(null);

    //             this.errorMessage.set('The profile was not found.');

    //             return;
    //         }

    //         // Save the loaded profile.
    //         this.profile.set(profile);
    //         this.profileService.selectedProfile.set(profile);
    //     } catch (error) {
    //         console.error(error);

    //         this.profile.set(null);
    //         this.profileService.selectedProfile.set(null);

    //         this.errorMessage.set('The profile could not be loaded.');
    //     } finally {
    //         // Stop the loading message.
    //         this.loading.set(false);
    //     }
    // }
}
