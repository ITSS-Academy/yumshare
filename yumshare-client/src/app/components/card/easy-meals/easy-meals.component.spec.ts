import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EasyMealsComponent } from './easy-meals.component';

describe('EasyMealsComponent', () => {
  let component: EasyMealsComponent;
  let fixture: ComponentFixture<EasyMealsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EasyMealsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EasyMealsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
