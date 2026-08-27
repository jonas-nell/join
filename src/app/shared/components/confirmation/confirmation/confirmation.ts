import { Component, inject } from '@angular/core';
import { ConfirmationService } from '../../../services/confirmation-service';


@Component({
    selector: 'app-confirmation',
    templateUrl: './confirmation.html',
    styleUrl: './confirmation.scss',
})
export class ConfirmationDialog {
    readonly confirmationService = inject(ConfirmationService);
}