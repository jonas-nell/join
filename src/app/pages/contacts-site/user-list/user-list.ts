import { Component, inject, signal, computed, effect } from '@angular/core';
import { Profile } from '../../../shared/interfaces/profile';
// import { createProfileColor, createProfileInitials } from '../../../shared/helpers/profile-helper';
import { ProfileService } from '../../../shared/services/profile-service';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { DialogService } from '../../../shared/services/dialog-service';
import { UserBadge } from '../../../shared/components/user-badge/user-badge';

@Component({
    selector: 'app-user-list',
    standalone: true,
    imports: [RouterLink, RouterLinkActive, UserBadge],
    templateUrl: './user-list.html',
    styleUrl: './user-list.scss',
})
export class UserList {
    // inject() gives this component access to the Supabase service
    private readonly profileService = inject(ProfileService);

    dialogservice = inject(DialogService);

    // Stores the loaded profiles.
    // A signal automatically updates the HTML when its value changes.
    readonly profiles = this.profileService.profiles;
    // True while Angular is waiting for Supabase.
    readonly loading = this.profileService.profilesLoading;
    // Contains a error message if loading fails...
    readonly errorMessage = this.profileService.profilesError;

    // Connecting the color helper to the HTML template.
    // readonly getProfileColor = createProfileColor;
    // readonly getInitials = createProfileInitials;

    // INstead of ngOnInit...
    // The effect runs once when the component starts. 
    // It runs again whenever profilesChanged increases.
    // Reload the list when a profile is created or deleted.
    // private readonly reloadProfiles = effect(() => {
    //     // Reading this signal makes the effect listen to it.
    //     this.profileService.profilesChanged();

    //     // Load the current profiles from Supabase.
    //     void this.loadProfiles();
    // });

    // Loads all profiles from the Supabase service.
    // async loadProfiles(): Promise<void> {
    //     // Show the loading message...
    //     this.loading.set(true);
    //     // "Reset" in case of old error message.
    //     this.errorMessage.set('');

    //     try {
    //         const profiles = await this.profileService.getProfiles();

    //         // Save the returned profiles in the signal.
    //         this.profiles.set(profiles);
    //     } catch (error) {
    //         console.error('Profiles could not be loaded:');

    //         this.errorMessage.set('The profiles could not be loaded.');
    //     } finally {
    //         // The request has finished. Stop showing the loading indicator...
    //         this.loading.set(false);
    //     }
    // }

    // Group the users by the first letter of their name.
    readonly groupedProfiles = computed(() => {
        const groups = new Map<string, Profile[]>();

        // Remove users without a name and sort the remaining users.
        const sortedProfiles = [...this.profiles()]
            .filter((profile) => profile.user_name.trim())
            .sort((first, second) => first.user_name.localeCompare(second.user_name));

        // Add every user to the correct letter group.
        for (const profile of sortedProfiles) {
            const letter = profile.user_name.charAt(0).toUpperCase();

            const users = groups.get(letter) ?? [];

            users.push(profile);
            groups.set(letter, users);
        }

        // Change the Map into an array that the HTML can display.
        return Array.from(groups, ([letter, profiles]) => ({
            letter,
            profiles,
        }));
    });
}
