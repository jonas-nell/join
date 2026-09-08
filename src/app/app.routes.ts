import { Routes } from '@angular/router';

import { LegalNotice } from './pages/legal-notice/legal-notice';
import { PrivacyPolicy } from './pages/privacy-policy/privacy-policy';
import { Help } from './pages/help/help';
import { ContactsSite } from './pages/contacts-site/contacts-site';
import { Board } from './pages/board/board';
import { AddTask } from './pages/add-task/add-task';
import { Login } from './pages/login/login';
import { Summary } from './pages/summary/summary';
import { supabaseAuthGuard } from './auth-functional-guard';

export const routes: Routes = [
    {
        path: 'login',
        component: Login,
        children: [
            {
                path: '',
                pathMatch: 'full',
                loadComponent: () =>
                    import('./pages/login/login-form/login-form').then(
                        (component) => component.LoginForm,
                    ),
            },
            {
                path: 'signup',
                loadComponent: () =>
                    import('./pages/login/signup-form/signup-form').then(
                        (component) => component.SignupForm,
                    ),
            },
        ],
    },

    {
        path: 'summary',
        component: Summary,
        canActivate: [supabaseAuthGuard],
    },
    {
        path: 'contacts',
        component: ContactsSite,
        canActivate: [supabaseAuthGuard],
        children: [
            {
                path: ':id',
                loadComponent: () =>
                    import('./pages/contacts-site/user-profile/user-profile').then(
                        (component) => component.UserProfile,
                    ),
            },
        ],
    },
    {
        path: 'add-task',
        component: AddTask,
        canActivate: [supabaseAuthGuard],
    },
    {
        path: 'legal-notice',
        component: LegalNotice,
    },
    {
        path: 'privacy-policy',
        component: PrivacyPolicy,
    },
    {
        path: 'help',
        component: Help,
        canActivate: [supabaseAuthGuard],
    },
    {
        path: 'board',
        component: Board,
        canActivate: [supabaseAuthGuard],
    },

    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'login',
    },
    {
        path: '**',
        redirectTo: 'login',
    },
];
