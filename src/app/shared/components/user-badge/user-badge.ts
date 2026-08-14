import { Component, input } from '@angular/core';

import { createProfileColor, createProfileInitials } from '../../helpers/profile-helper';

// This component displays a reusable profile badge.
//
// It receives a user ID and username from its parent.
// The helper functions calculate the badge color and initials.
//
// The same user always receives the same color because the color
// is calculated from the user's unique ID.
//
// The size input allows the badge to have a different size
// in the user list and the large profile view.

@Component({
    selector: 'app-user-badge',
    standalone: true,
    templateUrl: './user-badge.html',
    styleUrl: './user-badge.scss',
})
export class UserBadge {
    // Receive the unique profile ID.
    readonly userId = input.required<string>();

    // True when the profile is currently selected.
    readonly active = input(false);

    // Receive the username shown as initials.
    readonly userName = input.required<string>();

    // Use a small badge by default.
    readonly size = input<'small' | 'large'>('small');

    // Make the helper functions available in the HTML.
    readonly getProfileColor = createProfileColor;
    readonly getInitials = createProfileInitials;
}
