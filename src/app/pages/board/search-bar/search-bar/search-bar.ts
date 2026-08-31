import { Component, inject, signal } from '@angular/core';
import { Taskmanagement } from '../../../../shared/services/taskmanagement';

@Component({
    selector: 'app-search-bar',
    templateUrl: './search-bar.html',
    styleUrl: './search-bar.scss',
})
export class SearchBar {
    // Make task service available in this component...
    readonly taskmanagementService = inject(Taskmanagement);

    // Store if minimum-character-length error should be shown
    readonly searchError = signal(false);

    // Runs whenever the value in the search field changes.
    updateSearch(event: Event): void {
        // Get search input
        const input = event.target as HTMLInputElement;

        // Get text from imput
        const searchTerm = input.value;

        // Update the search term and startsearch
        this.taskmanagementService.searchTerm.set(searchTerm);

        // Remove error when the user types or clears the field
        this.searchError.set(false);
    }

    // Start search if user clicks the search button or Enter
    startSearch(): void {
        // remove spaces at the start or end
        const searchTerm =
            this.taskmanagementService.searchTerm().trim();

        if (searchTerm.length < 3) {
            this.searchError.set(true);
            return;
        }

        this.searchError.set(false);

        // Start the search with the "cleaned" search term...
        this.taskmanagementService.searchTerm.set(searchTerm);
    }
}