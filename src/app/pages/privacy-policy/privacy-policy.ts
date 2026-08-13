import { Component } from '@angular/core';
import { BackButton } from "../../shared/components/back-button/back-button";

@Component({
    selector: 'app-privacy-policy',
    imports: [BackButton],
    templateUrl: './privacy-policy.html',
    styleUrl: './privacy-policy.scss',
})
export class PrivacyPolicy {}
