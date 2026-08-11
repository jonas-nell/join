import { Component, signal } from '@angular/core';
import { UserList } from '../../shared/components/user-list/user-list';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-contacts-site',
  imports: [RouterOutlet, UserList],
  templateUrl: './contacts-site.html',
  styleUrl: './contacts-site.scss',
})
export class ContactsSite {
  // True when a profile route is open.
  readonly profileOpen = signal(false);
}
