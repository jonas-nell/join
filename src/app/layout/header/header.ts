import { Component, effect, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';

import { DialogService } from '../../shared/services/dialog-service';
import { DatabaseService } from '../../shared/services/database-service';
import { ProfileService } from '../../shared/services/profile-service';
import { Profile } from '../../shared/interfaces/profile';
import { UserBadge } from '../../shared/components/user-badge/user-badge';
import { HeaderMenu } from './nav-bar/header-menu';

@Component({
    selector: 'app-header',
    imports: [HeaderMenu, RouterLink, UserBadge],
    templateUrl: './header.html',
    styleUrl: './header.scss',
})
export class Header {
    readonly dialogService = inject(DialogService);
    private readonly router = inject(Router);

    // Give the header access to the current login session.
    private readonly databaseService = inject(DatabaseService);

    // Give the header access to profiles.
    private readonly profileService = inject(ProfileService);

    // Anonymous guests also have an Auth user ID,
    // which is needed to create the user-badge color
    readonly authUserId = this.databaseService.authUserId;

    // Return true when the current user is an anonymous guest.
    readonly isAnonymous = this.databaseService.isAnonymous;

    // Return true when a registered user or guest is logged in.
    readonly isAuthenticated = this.databaseService.isAuthenticated;

    // Store the profile of the logged-in registered user.
    // Anonymous guests do not have a profile.
    readonly loggedInProfile = signal<Profile | null>(null);

    constructor() {
        // Run when the current profile ID changes.
        // Load the profile when a registered user logs in.
        // Remove the profile when the user logs out or a guest logs in.
        effect(() => {
            // also rerun when the shared profile list changes.
            this.profileService.profiles();

            const profileId = this.databaseService.profileId();

            if (!profileId) {
                this.loggedInProfile.set(null);
                return;
            }

            void this.loadLoggedInProfile(profileId);
        });
    }

    // Load the profile that belongs to the logged-in user.
    private async loadLoggedInProfile(profileId: string): Promise<void> {
        try {
            const profile = await this.profileService.getProfileById(profileId);

            // Stop if the user changed while the request was loading.
            // This prevents an old profile from being displayed.
            if (this.databaseService.profileId() !== profileId) {
                return;
            }

            this.loggedInProfile.set(profile);
        } catch (error) {
            console.error('Logged-in profile could not be loaded:', error);

            this.loggedInProfile.set(null);
        }
    }

    readonly isBoardPage = toSignal(
        this.router.events.pipe(
            filter((event) => event instanceof NavigationEnd),
            map(() => this.router.url.startsWith('/board')),
        ),
        {
            initialValue: this.router.url.startsWith('/board'),
        },
    );
}
