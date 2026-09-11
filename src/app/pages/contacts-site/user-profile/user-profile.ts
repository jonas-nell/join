import { Component, OnInit, effect, inject, signal, computed } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Profile } from '../../../shared/interfaces/profile';
import { ProfileService } from '../../../shared/services/profile-service';
import { UserBadge } from '../../../shared/components/user-badge/user-badge';
import { DialogService } from '../../../shared/services/dialog-service';
import { retry } from 'rxjs';
import { ProfileDeletionService } from '../../../shared/services/profile-deletion-service';
import { ConfirmationDialog } from '../../../shared/components/confirmation/confirmation/confirmation';

@Component({
    selector: 'app-user-profile',
    standalone: true,
    imports: [UserBadge, ConfirmationDialog],
    templateUrl: './user-profile.html',
    styleUrl: './user-profile.scss',
})
export class UserProfile implements OnInit {
    private readonly route = inject(ActivatedRoute);

    private readonly profileService = inject(ProfileService);
    readonly profileDeletion = inject(ProfileDeletionService);

    private readonly profileId = signal<string | null>(null);

    readonly profile = computed(() => {
        const id = this.profileId();

        return id ? (this.profileService.getCachedProfileById(id) ?? null) : null;
    });

    readonly profileList = computed(() => {
        const selectedProfile = this.profile();
        return selectedProfile ? [selectedProfile] : [];
    });

    readonly loading = signal(true);

    readonly errorMessage = signal('');

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
}
