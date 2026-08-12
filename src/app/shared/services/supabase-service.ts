import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { Profile } from '../interfaces/profile';

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

    // Loads the profiles from the Supabase "profiles" table.
    async getProfiles(): Promise<Profile[]> {
        const { data, error } = await this.supabase
            .from('profiles')
            .select(
                `
        id,
        user_name,
        user_email,
        user_phone,
        user_role,
        created_at
      `,
            )
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
            .select(
                `
      id,
      user_name,
      user_email,
      user_phone,
      user_role,
      created_at
    `,
            )
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
}
