import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ContactsSite } from "./pages/contacts-site/contacts-site";
import { NavBar } from "./layout/nav-bar/nav-bar";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ContactsSite, NavBar],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('join');
}
