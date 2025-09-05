import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatStepperModule } from '@angular/material/stepper';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { RecipeService } from '../../services/recipe/recipe.service';
import { Category } from '../../models/category.model';
import { RecipeStep } from '../../models/recipe-step.model';
import { PaginatedResponse } from '../../models/paginated-response.model';
import { SafePipe } from '../../pipes/safe.pipe';
import { AuthModel } from '../../models/auth.model';
import { AuthState } from '../../ngrx/auth/auth.state';

@Component({
  selector: 'app-add-recipe',
  templateUrl: './add-recipe.component.html',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatStepperModule,
    SafePipe
  ],
  styleUrls: ['./add-recipe.component.scss']
})
export class AddRecipeComponent implements OnInit, OnDestroy {
  @ViewChild('imageInput') imageInput!: ElementRef<HTMLInputElement>;
  @ViewChild('videoInput') videoInput!: ElementRef<HTMLInputElement>;
  @ViewChild('ingredientsListContainer') ingredientsListRef!: ElementRef<HTMLDivElement>;
  @ViewChild('stepsListContainer') stepsListRef!: ElementRef<HTMLDivElement>;

  recipeForm: FormGroup;
  categories: Category[] = [];
  selectedImage: File | null = null;
  selectedVideo: File | null = null;
  imagePreview: string | null = null;
  videoPreview: string | null = null;
  youtubeUrl: string = '';
  videoType: 'file' | 'youtube' = 'file';
  uploading = false;
  difficultyLevels: string[] = ['Easy', 'Medium', 'Hard'];
  countries: string[] = ['Vietnam', 'Thailand', 'Japan', 'China', 'Korea', 'Italy', 'France', 'Spain', 'Mexico', 'India', 'United States', 'Other'];
  currentUser: AuthModel | null = null;

  currentStep: number = 1;
  private subscriptions: Subscription[] = [];

  constructor(
    private recipeService: RecipeService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private store: Store<{auth: AuthState}>
  ) {
    this.recipeForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      servings: [1, [Validators.required, Validators.min(1)]],
      total_cooking_time: [90, Validators.required],
      difficulty: ['Medium', Validators.required],
      country: ['Vietnam', Validators.required],
      category_id: ['', Validators.required],
      ingredients: this.fb.array([
        this.fb.control('', Validators.required)
      ]),
      steps: this.fb.array([
        this.createStepFormGroup(1)
      ])
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    this.subscriptions = [];
  }

  ngOnInit() {
    this.loadCategories();
    this.loadCurrentUser();
    this.ensureDefaultValues();
  }

  private createStepFormGroup(stepNumber: number): FormGroup {
    return this.fb.group({
      step_number: [stepNumber],
      description: ['', Validators.required],
      cooking_time: [0],
      tips: ['']
    });
  }

  get ingredients() {
    return this.recipeForm.get('ingredients') as FormArray || this.fb.array([]);
  }

  get steps() {
    return this.recipeForm.get('steps') as FormArray || this.fb.array([]);
  }

  get safeCategories() {
    return Array.isArray(this.categories) ? this.categories : [];
  }

  get safeCountries() {
    return Array.isArray(this.countries) ? this.countries : [];
  }

  get safeDifficultyLevels() {
    return Array.isArray(this.difficultyLevels) ? this.difficultyLevels : [];
  }

  getIngredientControl(index: number): FormControl {
    return this.ingredients.at(index) as FormControl;
  }

  getStepControl(index: number): FormGroup {
    return this.steps.at(index) as FormGroup;
  }

  getStepDescriptionControl(index: number): FormControl {
    return this.getStepControl(index).get('description') as FormControl;
  }

  addIngredient() {
    this.ingredients.push(this.fb.control('', Validators.required));
    setTimeout(() => this.scrollIngredientsListToBottom(), 0);
  }

  removeIngredient(index: number) {
    if (this.ingredients.length > 1) {
      this.ingredients.removeAt(index);
    }
  }

  addStep() {
    const stepNumber = this.steps.length + 1;
    this.steps.push(this.createStepFormGroup(stepNumber));
    setTimeout(() => this.scrollStepsListToBottom(), 0);
  }

  removeStep(index: number) {
    if (this.steps.length > 1) {
      this.steps.removeAt(index);
      this.steps.controls.forEach((control, i) => {
        control.patchValue({ step_number: i + 1 });
      });
    }
  }

  private scrollIngredientsListToBottom() {
    if (this.ingredientsListRef) {
      const container = this.ingredientsListRef.nativeElement;
      if (container.scrollHeight > container.clientHeight) {
        container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
      }
    }
  }

  private scrollStepsListToBottom() {
    if (this.stepsListRef) {
      const container = this.stepsListRef.nativeElement;
      if (container.scrollHeight > container.clientHeight) {
        container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
      }
    }
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedImage = file;
      const reader = new FileReader();
      reader.onload = (e) => this.imagePreview = e.target?.result as string;
      reader.readAsDataURL(file);
    }
  }

  onVideoSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedVideo = file;
      const url = URL.createObjectURL(file);
      this.videoPreview = url;
    }
  }

  onVideoDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onVideoDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('video/')) {
        this.selectedVideo = file;
        const url = URL.createObjectURL(file);
        this.videoPreview = url;
      }
    }
  }

  onVideoClick() {
    this.videoInput.nativeElement.click();
  }

  onVideoTypeChange(event: MatButtonToggleChange) {
    this.videoType = event.value as 'file' | 'youtube';
    if (this.videoType === 'youtube') {
      this.selectedVideo = null;
      this.videoPreview = null;
    } else {
      this.youtubeUrl = '';
    }
  }

  onYoutubeUrlChange(url: string) {
    this.youtubeUrl = url;
    const videoId = this.extractYoutubeVideoId(url);
    if (videoId) {
      this.videoPreview = `https://www.youtube.com/embed/${videoId}`;
    }
  }

  private extractYoutubeVideoId(url: string): string | null {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }

  isValidYoutubeUrl(url: string): boolean {
    return this.extractYoutubeVideoId(url) !== null;
  }

  loadCategories() {
    const categoriesSubscription = this.recipeService.getCategories().subscribe({
      next: (response: any) => {
        let categories: Category[] = [];
        if (Array.isArray(response)) {
          categories = response;
        } else if (response && response.data && Array.isArray(response.data)) {
          categories = response.data;
        }
        if (categories && categories.length > 0) {
          this.categories = categories;
          this.recipeForm.patchValue({ category_id: categories[0].id });
        } else {
          this.categories = [
            { id: 'fallback-1', name: 'Vietnamese Cuisine', image_url: '', is_active: true, sort_order: 1, created_at: new Date(), updated_at: new Date() },
            { id: 'fallback-2', name: 'Asian Cuisine', image_url: '', is_active: true, sort_order: 2, created_at: new Date(), updated_at: new Date() },
            { id: 'fallback-3', name: 'Western Cuisine', image_url: '', is_active: true, sort_order: 3, created_at: new Date(), updated_at: new Date() }
          ];
          this.snackBar.open('Using fallback categories - Check API connection', 'Close', { duration: 5000 });
          this.recipeForm.patchValue({ category_id: 'fallback-1' });
        }
      },
      error: (error) => {
        this.categories = [
          { id: 'fallback-1', name: 'Vietnamese Cuisine', image_url: '', is_active: true, sort_order: 1, created_at: new Date(), updated_at: new Date() },
          { id: '2', name: 'Asian Cuisine', image_url: '', is_active: true, sort_order: 2, created_at: new Date(), updated_at: new Date() },
          { id: 'fallback-3', name: 'Western Cuisine', image_url: '', is_active: true, sort_order: 3, created_at: new Date(), updated_at: new Date() }
        ];
        this.snackBar.open('API Error - Using fallback categories', 'Close', { duration: 5000 });
        this.recipeForm.patchValue({ category_id: 'fallback-1' });
      }
    });
    this.subscriptions.push(categoriesSubscription);
  }

  loadCurrentUser() {
    const authSubscription = this.store.select('auth').subscribe((authState: AuthState) => {
      if (authState && authState.currentUser && authState.currentUser.uid) {
        this.currentUser = authState.currentUser;
      } else {
        this.currentUser = null;
      }
    });
    this.subscriptions.push(authSubscription);
  }

  private ensureDefaultValues() {
    if (this.categories.length > 0 && !this.recipeForm.get('category_id')?.value) {
      this.recipeForm.patchValue({ category_id: this.categories[0].id });
    }
  }

  formatTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ${mins} minute${mins > 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    } else {
      return `${mins} minute${mins > 1 ? 's' : ''}`;
    }
  }

  async onSubmit() {
    if (!this.currentUser) {
      this.snackBar.open('Please login to create a recipe', 'Close', { duration: 3000 });
      return;
    }
    if (this.recipeForm.valid) {
      this.uploading = true;
      try {
        const formData = new FormData();
        const recipeData = this.recipeForm.value;
        formData.append('title', recipeData.title);
        formData.append('description', recipeData.description);
        formData.append('servings', recipeData.servings.toString());
        formData.append('total_cooking_time', recipeData.total_cooking_time.toString());
        formData.append('difficulty', recipeData.difficulty);
        formData.append('country', recipeData.country);
        formData.append('category_id', recipeData.category_id);
        formData.append('user_id', this.currentUser?.uid || 'anonymous-user');
        formData.append('ingredients', JSON.stringify(recipeData.ingredients));
        formData.append('steps', JSON.stringify(recipeData.steps));
        if (this.selectedImage) {
          formData.append('image', this.selectedImage);
        }
        if (this.videoType === 'file' && this.selectedVideo) {
          formData.append('video', this.selectedVideo);
        } else if (this.videoType === 'youtube' && this.youtubeUrl) {
          formData.append('video_url', this.youtubeUrl);
        }
        await this.recipeService.createRecipeWithFiles(formData).toPromise();
        this.snackBar.open('Recipe created successfully!', 'Close', { duration: 3000 });
        this.resetForm();
      } catch (error) {
        this.snackBar.open('Error creating recipe. Please try again.', 'Close', { duration: 3000 });
      } finally {
        this.uploading = false;
      }
    } else {
      this.markFormGroupTouched();
      this.snackBar.open('Please fill in all required fields', 'Close', { duration: 3000 });
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.recipeForm.controls).forEach(key => {
      const control = this.recipeForm.get(key);
      if (control instanceof FormGroup) {
        this.markFormGroupTouched();
      } else {
        control?.markAsTouched();
      }
    });
  }

  private resetForm() {
    this.recipeForm.reset({
      servings: 1,
      total_cooking_time: 90,
      difficulty: 'Medium',
      country: 'Vietnam'
    });
    this.ingredients.clear();
    this.steps.clear();
    this.ingredients.push(this.fb.control('', Validators.required));
    this.steps.push(this.createStepFormGroup(1));
    this.selectedImage = null;
    this.selectedVideo = null;
    this.imagePreview = null;
    this.videoPreview = null;
    this.youtubeUrl = '';
    this.videoType = 'file';
    this.currentStep = 1;
  }

  onDelete() {
    if (confirm('Are you sure you want to delete this recipe? All unsaved changes will be lost.')) {
      this.resetForm();
    }
  }

  nextStep() {
    if (this.currentStep < 4) {
      this.currentStep++;
      this.scrollToTop();
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.scrollToTop();
    }
  }

  private scrollToTop() {
    const headerHeight = 120;
    window.scrollTo({
      top: headerHeight,
      behavior: 'smooth'
    });
    setTimeout(() => {
      const container = document.querySelector('.add-recipe');
      if (container) {
        container.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 200);
  }

  onImageClick() {
    this.imageInput.nativeElement.click();
  }

  setVideoType(type: 'file' | 'youtube') {
    this.videoType = type;
    this.videoPreview = null;
    this.selectedVideo = null;
    this.youtubeUrl = '';
  }
}
