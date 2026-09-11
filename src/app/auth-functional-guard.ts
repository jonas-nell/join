import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { DatabaseService } from './shared/services/database-service';

export const supabaseAuthGuard = () => {
    const databaseService = inject(DatabaseService);
    const router = inject(Router);

    return databaseService.getUser().then(({ data: { user } }) => {
        if (user) {
            return true;
        } else {
            return router.createUrlTree(['/login']);
        }
    });
};
