import { Component, inject, signal, computed } from '@angular/core';
import { DatabaseService } from '../../services/database-service';
import { ProfileService } from '../../services/profile-service';

@Component({
    selector: 'app-greeting',
    imports: [],
    templateUrl: './greeting.html',
    styleUrl: './greeting.scss',
})
export class Greeting {
    private readonly database = inject(DatabaseService);
    private readonly profileService = inject(ProfileService);

    constructor() {
        void this.profileService.ensureProfilesLoaded();
    }

    readonly userName = computed<string | null>(() => {
        const profileId = this.database.profileId();

        if (!profileId) {
            return null;
        }

        return this.profileService.getCachedProfileById(profileId)?.user_name ?? null ;
    });

    readonly timeGreeting = signal(this.computeTimeGreeting());

    private computeTimeGreeting(): string {
        const hour = new Date().getHours();

        if (hour < 5) {
            return 'Good night';
        } else if (hour < 12) {
            return 'Good morning';
        } else if (hour < 18) {
            return 'Good afternoon';
        } else {
            return 'Good evening';
        }
    }
}
