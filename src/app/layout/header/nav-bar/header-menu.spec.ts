import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderMenu } from './header-menu';

describe('HeaderMenu', () => {
  let component: HeaderMenu;
  let fixture: ComponentFixture<HeaderMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderMenu],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderMenu);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
