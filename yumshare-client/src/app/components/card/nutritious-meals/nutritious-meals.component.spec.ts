import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NutritiousMealsComponent } from './nutritious-meals.component';

describe('NutritiousMealsComponent', () => {
  let component: NutritiousMealsComponent;
  let fixture: ComponentFixture<NutritiousMealsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NutritiousMealsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NutritiousMealsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
