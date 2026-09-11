import { Component, inject, signal, computed, effect } from '@angular/core';
import { Profile } from '../../../shared/interfaces/profile';
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
    private readonly profileService = inject(ProfileService);

    dialogservice = inject(DialogService);

    // Stores the loaded profiles.
    // A signal automatically updates the HTML when its value changes.
    readonly profiles = this.profileService.profiles;
    // True while Angular is waiting for Supabase.
    readonly loading = this.profileService.profilesLoading;
    // Contains a error message if loading fails...
    readonly errorMessage = this.profileService.profilesError;

    constructor() {
        // Load profiles if they have not already been loaded.
        void this.profileService.ensureProfilesLoaded();

        effect(() => {
            const contactId = this.profileService.scrollToNewContact();
            const profiles = this.profiles();

            if (!contactId || !profiles.length) {
                return;
            }
            setTimeout(() => {
                const contact = document.getElementById(`contact-${contactId}`);

                if (!contact) {
                    return;
                }

                contact.scrollIntoView({
                    block: 'center',
                });

                this.profileService.scrollToNewContact.set(null);
            });
        });
    }

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
