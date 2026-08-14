import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavBar } from "./layout/nav-bar/nav-bar";
import { Header } from "./layout/header/header";
import { NavigationHistoryService } from './shared/services/navigation-history.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavBar, Header],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('join');

  // injectinng on app startup for not missing first navEnd event
  constructor(private navHistory: NavigationHistoryService){

  }
}
