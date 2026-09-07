import { Component, ElementRef, effect, inject, input, signal, viewChild } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { DialogService } from '../../../shared/services/dialog-service';
import { DatabaseService } from '../../../shared/services/database-service';
import { Dialog } from '../../../shared/directives/dialog-directive';

@Component({
    selector: 'app-header-menu',
    imports: [Dialog, RouterLink, RouterLinkActive],
    templateUrl: './header-menu.html',
    styleUrl: './header-menu.scss',
})
export class HeaderMenu {
    readonly dialogservice = inject(DialogService);

    private readonly databaseService = inject(DatabaseService);
    private readonly router = inject(Router);

    readonly isLoggingOut = signal(false);

    async logout(): Promise<void> {
        this.isLoggingOut.set(true);

        try {
            const { error } = await this.databaseService.signOut();

            if (error) {
                console.error('Logout failed:', error.message);
                return;
            }

            this.dialogservice.closeDialog();
            await this.router.navigate(['/']);
        } finally {
            this.isLoggingOut.set(false);
        }
    }
}
