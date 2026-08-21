import { Component } from '@angular/core';
import { SearchBar } from './search-bar/search-bar/search-bar';
import { AddTaskButton } from '../../shared/components/add-task-button/add-task-button';

@Component({
    selector: 'app-board',
    imports: [AddTaskButton, SearchBar],
    templateUrl: './board.html',
    styleUrl: './board.scss',
})
export class Board {}
