import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RefreshingDishesComponent } from './refreshing-dishes.component';

describe('RefreshingDishesComponent', () => {
  let component: RefreshingDishesComponent;
  let fixture: ComponentFixture<RefreshingDishesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RefreshingDishesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RefreshingDishesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
