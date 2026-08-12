import { Component, inject, signal } from '@angular/core';
import { UserList } from '../../shared/components/user-list/user-list';
import { RouterLink, RouterOutlet } from '@angular/router';
import { SupabaseService } from '../../shared/services/supabase-service';

@Component({
    selector: 'app-contacts-site',
    imports: [RouterLink, RouterOutlet, UserList],
    templateUrl: './contacts-site.html',
    styleUrl: './contacts-site.scss',
})
export class ContactsSite {
    // True when a profile route is open.
    readonly profileOpen = signal(false);

    // Give the HTML access to shared notifications.
    readonly supabaseService = inject(SupabaseService);
}
