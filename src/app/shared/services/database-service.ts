import { computed, Injectable, signal } from '@angular/core';
import { createClient, Session, SupabaseClient } from '@supabase/supabase-js';

import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root',
})
export class DatabaseService {
    // Create the connection to database...
    readonly client: SupabaseClient = createClient(
        environment.supabaseUrl,
        environment.supabaseKey,
    );

    // Store the current Supabase login session.
    // The value is "null" when no user is logged in.
    private readonly session = signal<Session | null>(null);

    // Store the ID from the profiles table.
    // This is differrent from the authUserId
    private readonly currentProfileId = signal<string | null>(null);

    // Get the logged-in user's ID from Supabase Auth.
    // This ID matches profiles.auth_user_id.
    readonly authUserId = computed<string | null>(() => this.session()?.user.id ?? null);
    // logIn = signal(false);

    // Make the profile ID available to other components and services...
    readonly profileId = this.currentProfileId.asReadonly();

    // Return true when a user is logged in.
    readonly isAuthenticated = computed(() => this.authUserId() !== null);

    //  Guest-login...Return true when the current user is an anonymous guest.
    readonly isAnonymous = computed(() => this.session()?.user.is_anonymous === true);

    // Listen for login, logout, and session changes.
    // When a user logs in, load their profile ID.
    // if a user logs out, remove the stored profile ID...
    constructor() {
        this.client.auth.onAuthStateChange((_event, session) => {
            this.session.set(session);

            const authUserId = session?.user.id;

            if (authUserId) {
                void this.loadProfileId(authUserId);
            } else {
                this.currentProfileId.set(null);
            }
        });
    }

    // Find the profile that belongs to the logged-in Auth user.
    // Save the profile's own ID in currentProfileId.
    private async loadProfileId(authUserId: string): Promise<void> {
        const { data, error } = await this.client
            .from('profiles')
            .select('id')
            .eq('auth_user_id', authUserId)
            .maybeSingle();

        if (error) {
            console.error('Profile ID could not be loaded:', error);
            this.currentProfileId.set(null);
            return;
        }

        this.currentProfileId.set(data?.id ?? null);
    }

    // Create a new Supabase Auth account.
    // The username is saved as user metadata, The database trigger
    // uses this metadata to create the newprofile.
    async signUp(email: string, password: string, userName: string) {
        const signupClient = createClient(environment.supabaseUrl, environment.supabaseKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
    });
        const result = signupClient.auth.signUp({
            email: email.trim().toLowerCase(),
            password,
            options: {
                data: {
                    user_name: userName.trim(),
                },
            },
        });
        return result;
    }

    // Log in with an email address and password...
    async signIn(email: string, password: string) {
        return this.client.auth.signInWithPassword({
            email: email.trim().toLowerCase(),
            password,
        });
    }

    // Create a temporary anonymous user and session.
    // No profile is created for this user.
    async signInAsGuest() {
        return this.client.auth.signInAnonymously();
    }

    // Log out the current user.
    async signOut() {
        return this.client.auth.signOut();
    }

    // Ask superbase for the current authenticated user.
    getUser() {
        return this.client.auth.getUser();
    }
}
