import { Injectable, signal } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { Profile, ProfileChanges } from '../interfaces/profile';

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
export class SupabaseService {
    // This is the connection between Angular and Supabase.
    // Angular uses the project URL and publishable key
    // from the environment file.

    private readonly supabase: SupabaseClient;
    constructor() {
        this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
    }

    // This number changes whenever the profile list must reload.
    readonly profilesChanged = signal(0);

    // Store a short message shown to the user.
    readonly notification = signal('');

    // Loads the profiles from the Supabase "profiles" table.
    async getProfiles(): Promise<Profile[]> {
        const { data, error } = await this.supabase
            .from('profiles')
            .select(PROFILE_COLUMNS)
            .order('user_name');

        // Supabase returns an error object when the request fails.
        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }
        // Supabase may return null when no data is available,
        // in that case, return an empty array...
        return data ?? [];
    }

    // Load one profile using its unique ID.
    async getProfileById(profileId: string): Promise<Profile | null> {
        const { data, error } = await this.supabase
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

    // Update the editable fields of one profile.
    async updateProfile(profileId: string, changes: ProfileChanges): Promise<Profile> {
        const { data, error } = await this.supabase
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

    // await this.supabaseService.updateProfile(
    // selectedProfile.id,
    // {
    //     user_name: 'Anna Schmidt',
    //     user_email: 'anna@example.com',
    //     user_phone: '+49 123 456789',
    // })

    // Delete a dummy profile.
    //
    // The second filter makes sure that this method
    // cannot delete a normal user profile.
    // TODO: Important: the Angular filter is helpful, but the Supabase RLS policy must enforce the same rule.
    async deleteDummyProfile(profileId: string): Promise<void> {
        const { data, error } = await this.supabase
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
        this.profilesChanged.update((currentValue) => currentValue + 1);
    }

    // Show a message for three seconds.
    showNotification(message: string): void {
        this.notification.set(message);

        window.setTimeout(() => {
            this.notification.set('');
        }, 3000);
    }
}
