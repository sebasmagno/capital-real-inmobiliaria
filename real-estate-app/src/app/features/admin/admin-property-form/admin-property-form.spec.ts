import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminPropertyForm } from './admin-property-form';

describe('AdminPropertyForm', () => {
  let component: AdminPropertyForm;
  let fixture: ComponentFixture<AdminPropertyForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminPropertyForm],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminPropertyForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
