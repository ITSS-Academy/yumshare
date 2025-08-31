import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VeganDishesComponent } from './vegan-dishes.component';

describe('VeganDishesComponent', () => {
  let component: VeganDishesComponent;
  let fixture: ComponentFixture<VeganDishesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VeganDishesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VeganDishesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
