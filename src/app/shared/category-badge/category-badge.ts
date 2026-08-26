import { Component, input } from '@angular/core';

@Component({
    selector: 'app-category-badge',
    imports: [],
    templateUrl: './category-badge.html',
    styleUrl: './category-badge.scss',
})
export class CategoryBadge {
    category = input.required<string>();
}
