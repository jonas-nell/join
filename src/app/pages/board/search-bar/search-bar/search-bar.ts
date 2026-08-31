
import { Component, inject } from '@angular/core';
import { Taskmanagement } from '../../../../shared/services/taskmanagement';

@Component({
    selector: 'app-search-bar',
    templateUrl: './search-bar.html',
    styleUrl: './search-bar.scss',
})
export class SearchBar {
    readonly taskmanagementService = inject(Taskmanagement);

    // Runs every time the user changes the input in the searrch field
    updateSearch(event: Event): void {
        const input = event.target as HTMLInputElement;
        this.taskmanagementService.searchTerm.set(input.value);
    }

    clearSearch(): void {
        this.taskmanagementService.searchTerm.set('');
    }
}