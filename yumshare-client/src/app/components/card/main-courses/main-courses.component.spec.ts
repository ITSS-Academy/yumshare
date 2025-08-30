import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainCoursesComponent } from './main-courses.component';

describe('MainCoursesComponent', () => {
  let component: MainCoursesComponent;
  let fixture: ComponentFixture<MainCoursesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainCoursesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainCoursesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
