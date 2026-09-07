import { computed, Injectable, signal } from '@angular/core';
import {
  createClient,
  Session,
  SupabaseClient,
} from '@supabase/supabase-js';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  readonly client: SupabaseClient = createClient(
    environment.supabaseUrl,
    environment.supabaseKey,
  );

  private readonly session = signal<Session | null>(null);

  readonly isAuthenticated = computed(() => this.session() !== null);

  constructor() {
    this.client.auth.onAuthStateChange((_event, session) => {
      this.session.set(session);
    });
  }

  // async signUp(email: string, password: string) {
  //   return this.client.auth.signUp({ email, password });
  // }

  async signUp(email: string, password: string, userName: string) {
  return this.client.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: {
      data: {
        user_name: userName.trim(),
      },
    },
  });
}

  async signIn(email: string, password: string) {
    return this.client.auth.signInWithPassword({ email, password });
  }

  async signOut() {
    return this.client.auth.signOut();
  }

  getUser() {
    return this.client.auth.getUser();
  }
}


