import { Component, inject, OnInit, signal } from '@angular/core';
import { Taskmanagement } from '../../shared/services/taskmanagement';
import { DatePipe } from '@angular/common';
import { Task } from '../../shared/interfaces/task';
import { Router } from '@angular/router';
import { Greeting } from "../../shared/components/greeting/greeting";
import { LoginTransitionService } from '../../shared/services/login-transition-service';

const PRIORITY_DISPLAY: Record<Task['task_priority'], { icon: string; color: string }> = {
    urgent: { icon: 'Prio urgent white.png', color: 'red' },
    medium: { icon: 'Prio medium white.png', color: 'orange' },
    low: { icon: 'Prio low white.png', color: 'green' },
};

@Component({
    selector: 'app-summary',
    imports: [DatePipe, Greeting],
    templateUrl: './summary.html',
    styleUrl: './summary.scss',
})
export class Summary implements OnInit {
    taskmanagement = inject(Taskmanagement);
    priorityDisplay = PRIORITY_DISPLAY;
    private router = inject(Router);
    private loginTransition = inject(LoginTransitionService);

    readonly showLoginOverlay = signal(false);
    readonly loginOverlayFadingOut = signal(false);

    ngOnInit(): void {
        this.taskmanagement.ensureTasksLoaded();

        if (this.loginTransition.consume()){
            this.showLoginOverlay.set(true);

            setTimeout(() => this.loginOverlayFadingOut.set(true), 2000);
        }
    }

    onLoginOverlayTransitionEnd(): void {
        this.showLoginOverlay.set(false);
    }

    navigateIfButton(event: MouseEvent) {
        const target = event.target as HTMLElement;
        if (target.closest('button')) {
            this.router.navigateByUrl('/board');
        }
    }
}
