import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        // Load the complete contacts page.
        path: 'contacts',
        loadComponent: () =>
            import('./pages/contacts-site/contacts-site').then(
                (component) => component.ContactsSite,
            ),

        children: [
            {
                // Load the selected profile inside ContactsSite.
                path: ':id',
                loadComponent: () =>
                    import('./shared/components/user-profile/user-profile').then(
                        (component) => component.UserProfile,
                    ),
            },
        ],
    },
    {
        // Open the contacts page when no route is provided.
        path: '',
        redirectTo: 'contacts',
        pathMatch: 'full',
    },
];
