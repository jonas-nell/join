import { Component } from '@angular/core';
import { BackButton } from "../../shared/components/back-button/back-button";

@Component({
    selector: 'app-legal-notice',
    imports: [BackButton],
    templateUrl: './legal-notice.html',
    styleUrl: './legal-notice.scss',
})
export class LegalNotice {}
