import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FamilyMealComponent } from './family-meal.component';

describe('FamilyMealComponent', () => {
  let component: FamilyMealComponent;
  let fixture: ComponentFixture<FamilyMealComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FamilyMealComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FamilyMealComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
