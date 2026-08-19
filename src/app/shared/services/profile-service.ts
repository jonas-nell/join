import { Injectable, inject, signal } from '@angular/core';
import { Profile, ProfileChanges } from '../interfaces/profile';
import { DatabaseService } from './database-service';

const PROFILE_COLUMNS = `
    id,
    user_name,
    user_email,
    user_phone,
    user_role,
    auth_user_id,
    created_at
`;

@Injectable({
    providedIn: 'root',
})
export class ProfileService {
    // Get access to the shared Supabase connection.
private readonly database = inject(DatabaseService);
    
    readonly profiles = signal<Profile[]>([]);

    readonly profilesLoading = signal(false);
    readonly profilesError = signal('');

    scrollToNewContact = signal<string | null>(null);
    // // This number changes whenever the profile list must reload.
    // readonly profilesChanged = signal(0);

    readonly selectedProfile = signal<Profile | null>(null);

    private profilesRequested = false;

    private profilesResquest: Promise<void> | null = null;

    async ensureProfilesLoaded(forceReload = false): Promise<void> {
        if (!forceReload && this.profilesRequested) {
            if (this.profilesResquest) {
                await this.profilesResquest;
            }

            return;
        }

        this.profilesRequested = true;
        this.profilesResquest = this.loadProfiles();

        await this.profilesResquest;
    }

    private async loadProfiles(): Promise<void> {
        this.profilesLoading.set(true);
        this.profilesError.set('');

        try {
            const { data, error } = await this.database.client
            .from('profiles')
            .select(PROFILE_COLUMNS)
            .order('user_name');

            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }

            this.profiles.set(data ?? []);
        } catch (error) {
            this.profilesError.set('The profiles could not be loaded');
        } finally {
            this.profilesLoading.set(false);
            this.profilesResquest = null;
        }
    }

    getCachedProfileById(profileId: string): Profile | undefined {
        return this.profiles().find((profile) => profile.id === profileId);
    }

    // Store a short message shown to the user.
    // readonly notification = signal('');

    // Loads the profiles from the Supabase "profiles" table.
    // async getProfiles(): Promise<Profile[]> {
    //     const { data, error } = await this.database.client
    //         .from('profiles')
    //         .select(PROFILE_COLUMNS)
    //         .order('user_name');

    //     // Supabase returns an error object when the request fails.
    //     if (error) {
    //         console.error('Supabase error:', error);
    //         throw error;
    //     }
    //     // Supabase may return null when no data is available,
    //     // in that case, return an empty array...
    //     return data ?? [];
    // }

    // Load one profile using its unique ID.
    async getProfileById(profileId: string): Promise<Profile | null> {
        const { data, error } = await this.database.client
            .from('profiles')
            .select(PROFILE_COLUMNS)
            .eq('id', profileId)
            .maybeSingle();

        // Stop when Supabase returns an error.
        if (error) {
            console.error('The profile could not be loaded:', error);

            throw error;
        }

        // Return the profile or null when it does not exist.
        return data as Profile | null;
    }

    //Create a new dummy contact
    async createProfile(changes: ProfileChanges): Promise<Profile> {
        const { data, error } = await this.database.client
        .from('profiles')
        .insert({ ...changes, user_role:'dummy' })
        .select(PROFILE_COLUMNS)
        .single();

        if (error) {
            console.error('The Profile could not be created:', error);

            throw error;
        }

        this.notifyProfilesChanged();

        return data as Profile;
    }

    // Update the editable fields of one profile.
    async updateProfile(profileId: string, changes: ProfileChanges): Promise<Profile> {
        const { data, error } = await this.database.client
            .from('profiles')
            .update(changes)
            .eq('id', profileId)
            .select(PROFILE_COLUMNS)
            .single();

        // Stop when Supabase cannot update the profile.
        if (error) {
            console.error('The profile could not be updated:', error);

            throw error;
        }

        // Reload the list so it displays the updated values.
        this.notifyProfilesChanged();

        // Return the updated profile.
        return data as Profile;
    }

    // Delete a dummy profile.
    //
    // The second filter makes sure that this method
    // cannot delete a normal user profile.
    // TODO: Important: the Angular filter is helpful, but the Supabase RLS policy must enforce the same rule.
    async deleteDummyProfile(profileId: string): Promise<void> {
        const { data, error } = await this.database.client
            .from('profiles')
            .delete()
            .eq('id', profileId)
            .eq('user_role', 'dummy')
            .select('id');

        // Stop when Supabase rejects the request.
        if (error) {
            console.error('The dummy profile could not be deleted:', error);

            throw error;
        }

        // Supabase returns an empty array when no row was deleted.
        if (!data || data.length === 0) {
            throw new Error('No dummy profile was deleted.');
        }

        // Tell the user list to load its data again.
        this.notifyProfilesChanged();
    }

    // Tell the user list that its data has changed.
    private notifyProfilesChanged(): void {
        void this.ensureProfilesLoaded(true);
    }
}
