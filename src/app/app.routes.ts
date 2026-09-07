import { Routes } from '@angular/router';
import { LegalNotice } from './pages/legal-notice/legal-notice';
import { PrivacyPolicy } from './pages/privacy-policy/privacy-policy';
import { Help } from './pages/help/help';
import { ContactsSite } from './pages/contacts-site/contacts-site';
import { Board } from './pages/board/board';
import { AddTask } from './pages/add-task/add-task';
import { supabaseAuthGuard } from './auth-functional-guard';
import { LoginComponent } from './pages/login/login-component/login-component';
import { SignupComponent } from './pages/login/signup-component/signup-component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'signup', component: SignupComponent },
    { path: 'contacts', component: ContactsSite },
    { path: 'add-task', component: AddTask },
    { path: 'legal-notice', component: LegalNotice },
    { path: 'privacy-policy', component: PrivacyPolicy },
    { path: 'help', component: Help },
    { path: 'board', component: Board, canActivate: [supabaseAuthGuard] },
    // default for part 1 of project is ContactsSite, to be changed later
    { path: 'signup', component: SignupComponent },
    
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
