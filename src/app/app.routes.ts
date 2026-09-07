import { Routes } from '@angular/router';
import { LegalNotice } from './pages/legal-notice/legal-notice';
import { PrivacyPolicy } from './pages/privacy-policy/privacy-policy';
import { Help } from './pages/help/help';
import { ContactsSite } from './pages/contacts-site/contacts-site';
import { Board } from './pages/board/board';
import { AddTask } from './pages/add-task/add-task';
import { supabaseAuthGuard } from './auth-functional-guard';
import { Login } from './pages/login/login';


export const routes: Routes = [
    { path: 'login', component: Login },
    { path: 'contacts', component: ContactsSite, canActivate: [supabaseAuthGuard]  },
    { path: 'add-task', component: AddTask, canActivate: [supabaseAuthGuard]  },
    { path: 'legal-notice', component: LegalNotice },
    { path: 'privacy-policy', component: PrivacyPolicy },
    { path: 'help', component: Help, canActivate: [supabaseAuthGuard]  },
    { path: 'board', component: Board, canActivate: [supabaseAuthGuard] },
    { path: '', component: Login },
    
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
    },
];
