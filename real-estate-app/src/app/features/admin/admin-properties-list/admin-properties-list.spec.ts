import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminPropertiesList } from './admin-properties-list';

describe('AdminPropertiesList', () => {
  let component: AdminPropertiesList;
  let fixture: ComponentFixture<AdminPropertiesList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminPropertiesList],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminPropertiesList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
