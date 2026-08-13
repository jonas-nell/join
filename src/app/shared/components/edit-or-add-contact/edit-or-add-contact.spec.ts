import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditOrAddContact } from './edit-or-add-contact';

describe('EditOrAddContact', () => {
    let component: EditOrAddContact;
    let fixture: ComponentFixture<EditOrAddContact>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [EditOrAddContact],
        }).compileComponents();

        fixture = TestBed.createComponent(EditOrAddContact);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
