import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ContactsSite } from "./pages/contacts-site/contacts-site";
import { Header } from "./layout/header/header";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ContactsSite, Header],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('join');
}
