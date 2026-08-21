import { TestBed } from '@angular/core/testing';

import { Taskmanagement } from './taskmanagement';

describe('Taskmanagement', () => {
    let service: Taskmanagement;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(Taskmanagement);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
