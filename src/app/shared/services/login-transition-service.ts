import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class LoginTransitionService {
    private readonly justLoggedIn = signal(false);

    trigger(): void {
        this.justLoggedIn.set(true);
    }

    consume(): boolean {
        const value = this.justLoggedIn();
        this.justLoggedIn.set(false);
        return value;
    }
}
