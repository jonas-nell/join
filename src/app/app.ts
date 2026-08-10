import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ContactsSite } from "./pages/contacts-site/contacts-site";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ContactsSite],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('join');
}
