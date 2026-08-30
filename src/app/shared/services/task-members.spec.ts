import { TestBed } from '@angular/core/testing';

import { TaskMembers } from './task-members';

describe('TaskMembers', () => {
    let service: TaskMembers;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(TaskMembers);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
