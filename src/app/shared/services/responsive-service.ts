import { BreakpointObserver } from '@angular/cdk/layout';
import { inject, Service } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

@Service()
export class ResponsiveService {

    breakpointObserver = inject(BreakpointObserver);

        isDesktop = toSignal(
        this.breakpointObserver.observe('(min-width: 1024px)').pipe(map(result => result.matches)),
        { initialValue: false }
    );
}
