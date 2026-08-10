import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactsSite } from './contacts-site';

describe('ContactsSite', () => {
  let component: ContactsSite;
  let fixture: ComponentFixture<ContactsSite>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactsSite],
    }).compileComponents();

    fixture = TestBed.createComponent(ContactsSite);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
