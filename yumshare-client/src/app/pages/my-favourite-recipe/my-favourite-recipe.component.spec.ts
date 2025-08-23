import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyFavouriteRecipeComponent } from './my-favourite-recipe.component';

describe('MyFavouriteRecipeComponent', () => {
  let component: MyFavouriteRecipeComponent;
  let fixture: ComponentFixture<MyFavouriteRecipeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyFavouriteRecipeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyFavouriteRecipeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
