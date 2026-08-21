import { Routes } from '@angular/router';
import { LegalNotice } from './pages/legal-notice/legal-notice';
import { PrivacyPolicy } from './pages/privacy-policy/privacy-policy';
import { Help } from './pages/help/help';
import { ContactsSite } from './pages/contacts-site/contacts-site';
import { Board } from './pages/board/board';


export const routes: Routes = [
    { path: 'contacts', component: ContactsSite},
    { path: 'legal-notice', component: LegalNotice },
    { path: 'privacy-policy', component: PrivacyPolicy },
    { path: 'help', component: Help },
    { path: 'board', component: Board},
    // default for part 1 of project is ContactsSite, to be changed later
    { path: '', component: ContactsSite},
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
                    import('./pages/contacts-site/user-profile/user-profile').then(
                        (component) => component.UserProfile,
                    ),
            },
        ],
    }
];
