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
import { User } from '../../models/user.model';
import * as AuthSelectors from '../../ngrx/auth/auth.selectors';
import * as CategoryActions from '../../ngrx/category/category.actions';
import * as CategorySelectors from '../../ngrx/category/category.selectors';
import { TranslatePipe } from '@ngx-translate/core';
import { TranslateService } from '@ngx-translate/core';
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
    SafePipe,
    TranslatePipe
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
  mineProfile: User | null = null;
  
  // Grid Multi-step properties
  currentStep: number = 1;

  
  private subscriptions: Subscription[] = [];

  constructor(
    private recipeService: RecipeService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private store: Store<{auth: AuthState, category: any}>,
    private translate: TranslateService
  ) {
    this.recipeForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]],
      servings: [1, [Validators.required, Validators.min(1), Validators.max(50)]],
      total_cooking_time: [90, [Validators.required, Validators.min(1), Validators.max(1440)]],
      difficulty: ['Medium', Validators.required],
      country: ['Vietnam', Validators.required],
      category_id: ['', Validators.required],
      ingredients: this.fb.array([
        this.fb.control('', [Validators.required, Validators.minLength(2), Validators.maxLength(100)])
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
    this.loadMineProfile();
    
    // Ensure default values are set
    this.ensureDefaultValues();
  }

  private createStepFormGroup(stepNumber: number): FormGroup {
    return this.fb.group({
      step_number: [stepNumber],
      description: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(500)]],
      cooking_time: [0, [Validators.min(0), Validators.max(300)]],
      tips: ['', Validators.maxLength(200)]
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
    this.ingredients.push(this.fb.control('', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]));
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
      if (this.validateImageFile(file)) {
        this.selectedImage = file;
        const reader = new FileReader();
        reader.onload = (e) => this.imagePreview = e.target?.result as string;
        reader.readAsDataURL(file);
      } else {
        // Reset the input
        event.target.value = '';
      }
    }
  }

  private validateImageFile(file: File): boolean {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      this.snackBar.open('Please select a valid image file (JPG, PNG, or WebP)', 'Close', { duration: 3000 });
      return false;
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      this.snackBar.open('Image file size must be less than 5MB', 'Close', { duration: 3000 });
      return false;
    }

    // Check minimum file size (1KB)
    const minSize = 1024; // 1KB
    if (file.size < minSize) {
      this.snackBar.open('Image file is too small', 'Close', { duration: 3000 });
      return false;
    }

    return true;
  }

  onVideoSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (this.validateVideoFile(file)) {
        this.selectedVideo = file;
        const url = URL.createObjectURL(file);
        this.videoPreview = url;
      } else {
        // Reset the input
        event.target.value = '';
      }
    }
  }

  private validateVideoFile(file: File): boolean {
    // Check file type
    const allowedTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm'];
    if (!allowedTypes.includes(file.type)) {
      this.snackBar.open('Please select a valid video file (MP4, AVI, MOV, WMV, or WebM)', 'Close', { duration: 3000 });
      return false;
    }

    // Check file size (100MB limit)
    const maxSize = 100 * 1024 * 1024; // 100MB in bytes
    if (file.size > maxSize) {
      this.snackBar.open('Video file size must be less than 100MB', 'Close', { duration: 3000 });
      return false;
    }

    // Check minimum file size (1MB)
    const minSize = 1024 * 1024; // 1MB
    if (file.size < minSize) {
      this.snackBar.open('Video file is too small (minimum 1MB)', 'Close', { duration: 3000 });
      return false;
    }

    return true;
  }
  
  getStepPlaceholder(i: number): string {
  return `${this.translate.instant('Describe step')} ${i + 1}...`;
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
        if (this.validateVideoFile(file)) {
          this.selectedVideo = file;
          const url = URL.createObjectURL(file);
          this.videoPreview = url;
        }
      } else {
        this.snackBar.open('Please drop a valid video file', 'Close', { duration: 3000 });
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
    
    if (url.trim() === '') {
      this.videoPreview = null;
      return;
    }

    // Validate YouTube URL
    if (this.isValidYoutubeUrl(url)) {
      // Extract video ID from YouTube URL for preview
      const videoId = this.extractYoutubeVideoId(url);
      if (videoId) {
        this.videoPreview = `https://www.youtube.com/embed/${videoId}`;
      }
    } else {
      this.videoPreview = null;
      if (url.length > 10) { // Only show error if user has typed something substantial
        this.snackBar.open('Please enter a valid YouTube URL', 'Close', { duration: 3000 });
      }
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
    console.log('🔄 Dispatching loadCategories action...');
    // Dispatch action to load categories
    this.store.dispatch(CategoryActions.loadCategories());
    
    // Subscribe to categories from store
    const categoriesSubscription = this.store.select(CategorySelectors.selectCategoryListState).subscribe({
      next: ({ categories, loading, error }) => {
        console.log('📦 Category state received:', { categories, loading, error });
        
        // Check if categories is an array or has data property
        let categoriesArray: Category[] = [];
        if (Array.isArray(categories)) {
          categoriesArray = categories;
        } else if (categories && (categories as any).data && Array.isArray((categories as any).data)) {
          categoriesArray = (categories as any).data;
        }
        
        if (categoriesArray && categoriesArray.length > 0) {
          console.log('✅ Categories loaded successfully:', categoriesArray);
          this.categories = categoriesArray;
          
          // Set the first category as default if form is empty
          if (!this.recipeForm.get('category_id')?.value) {
            this.recipeForm.patchValue({ category_id: categoriesArray[0].id });
            console.log('🎯 Set default category:', categoriesArray[0].id);
          }
        } else if (!loading && !error) {
          console.log('⚠️ No categories found, using fallback');
          // Use fallback categories if no data and not loading
          this.categories = [
            { id: 'fallback-1', name: 'Vietnamese Cuisine', image_url: '', is_active: true, sort_order: 1, created_at: new Date(), updated_at: new Date() },
            { id: 'fallback-2', name: 'Asian Cuisine', image_url: '', is_active: true, sort_order: 2, created_at: new Date(), updated_at: new Date() },
            { id: 'fallback-3', name: 'Western Cuisine', image_url: '', is_active: true, sort_order: 3, created_at: new Date(), updated_at: new Date() }
          ];
          this.recipeForm.patchValue({ category_id: 'fallback-1' });
        }
        
        if (error) {
          console.error('❌ Error loading categories:', error);
          this.snackBar.open('Error loading categories - Using fallback', 'Close', { duration: 3000 });
          this.categories = [
            { id: 'fallback-1', name: 'Vietnamese Cuisine', image_url: '', is_active: true, sort_order: 1, created_at: new Date(), updated_at: new Date() },
            { id: 'fallback-2', name: 'Asian Cuisine', image_url: '', is_active: true, sort_order: 2, created_at: new Date(), updated_at: new Date() },
            { id: 'fallback-3', name: 'Western Cuisine', image_url: '', is_active: true, sort_order: 3, created_at: new Date(), updated_at: new Date() }
          ];
          this.recipeForm.patchValue({ category_id: 'fallback-1' });
        }
      }
    });
    
    this.subscriptions.push(categoriesSubscription);
  }

  loadMineProfile() {
    const profileSubscription = this.store.select(AuthSelectors.selectMineProfile).subscribe((profile: User | null) => {
      console.log('Mine profile received:', profile);
      
      if (profile && profile.id) {
        this.mineProfile = profile;
        console.log('Profile loaded successfully:', {
          id: this.mineProfile.id,
          username: this.mineProfile.username,
          email: this.mineProfile.email,
          avatar_url: this.mineProfile.avatar_url
        });
      } else {
        this.mineProfile = null;
        console.log('No profile found in auth state');
      }
    });
    
    // Add subscription to array
    this.subscriptions.push(profileSubscription);
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
    if (!this.mineProfile) {
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
        formData.append('user_id', this.mineProfile?.id || 'anonymous-user'); // Get from mine profile
        
        // Add ingredients as JSON string
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
      } else if (control instanceof FormArray) {
        control.controls.forEach(ctrl => {
          if (ctrl instanceof FormGroup) {
            Object.keys(ctrl.controls).forEach(subKey => {
              ctrl.get(subKey)?.markAsTouched();
            });
          } else {
            ctrl.markAsTouched();
          }
        });
      } else {
        control?.markAsTouched();
      }
    });
  }

  private validateCurrentStep(): boolean {
    switch (this.currentStep) {
      case 1:
        return this.validateStep1();
      case 2:
        return this.validateStep2();
      case 3:
        return this.validateStep3();
      case 4:
        return this.validateStep4();
      default:
        return true;
    }
  }

  private validateStep1(): boolean {
    const title = this.recipeForm.get('title');
    const description = this.recipeForm.get('description');
    
    let isValid = true;
    let errorMessage = '';

    if (!title?.value || title.value.trim() === '') {
      title?.markAsTouched();
      errorMessage = 'Recipe name is required';
      isValid = false;
    } else if (title.value.trim().length < 3) {
      title?.markAsTouched();
      errorMessage = 'Recipe name must be at least 3 characters long';
      isValid = false;
    } else if (title.value.trim().length > 100) {
      title?.markAsTouched();
      errorMessage = 'Recipe name must be less than 100 characters';
      isValid = false;
    }

    if (isValid && (!description?.value || description.value.trim() === '')) {
      description?.markAsTouched();
      errorMessage = 'Recipe description is required';
      isValid = false;
    } else if (isValid && description?.value && description.value.trim().length < 10) {
      description?.markAsTouched();
      errorMessage = 'Recipe description must be at least 10 characters long';
      isValid = false;
    } else if (isValid && description?.value && description.value.trim().length > 1000) {
      description?.markAsTouched();
      errorMessage = 'Recipe description must be less than 1000 characters';
      isValid = false;
    }

    if (!isValid) {
      this.snackBar.open(errorMessage, 'Close', { duration: 3000 });
    }

    return isValid;
  }

  private validateStep2(): boolean {
    const servings = this.recipeForm.get('servings');
    const totalCookingTime = this.recipeForm.get('total_cooking_time');
    const ingredients = this.recipeForm.get('ingredients') as FormArray;
    const steps = this.recipeForm.get('steps') as FormArray;

    let isValid = true;
    let errorMessage = '';

    // Validate servings
    if (!servings?.value || servings.value < 1) {
      servings?.markAsTouched();
      errorMessage = 'Servings must be at least 1';
      isValid = false;
    } else if (servings.value > 50) {
      servings?.markAsTouched();
      errorMessage = 'Servings cannot exceed 50';
      isValid = false;
    }

    // Validate cooking time
    if (isValid && (!totalCookingTime?.value || totalCookingTime.value < 1)) {
      totalCookingTime?.markAsTouched();
      errorMessage = 'Total cooking time must be at least 1 minute';
      isValid = false;
    } else if (isValid && totalCookingTime?.value && totalCookingTime.value > 1440) { // 24 hours
      totalCookingTime?.markAsTouched();
      errorMessage = 'Total cooking time cannot exceed 24 hours (1440 minutes)';
      isValid = false;
    }

    // Validate ingredients
    if (isValid) {
      const validIngredients = ingredients.controls.filter(ctrl => 
        ctrl.value && ctrl.value.trim() !== ''
      );
      
      if (validIngredients.length === 0) {
        errorMessage = 'At least one ingredient is required';
        isValid = false;
      } else if (validIngredients.length > 50) {
        errorMessage = 'Maximum 50 ingredients allowed';
        isValid = false;
      }
    }

    // Validate steps
    if (isValid) {
      const validSteps = steps.controls.filter(ctrl => {
        const stepGroup = ctrl as FormGroup;
        const description = stepGroup.get('description');
        return description?.value && description.value.trim() !== '';
      });

      if (validSteps.length === 0) {
        errorMessage = 'At least one step is required';
        isValid = false;
      } else if (validSteps.length > 20) {
        errorMessage = 'Maximum 20 steps allowed';
        isValid = false;
      }
    }

    if (!isValid) {
      this.snackBar.open(errorMessage, 'Close', { duration: 3000 });
      this.markFormGroupTouched();
    }

    return isValid;
  }

  private validateStep3(): boolean {
    const categoryId = this.recipeForm.get('category_id');
    const difficulty = this.recipeForm.get('difficulty');
    const country = this.recipeForm.get('country');

    let isValid = true;
    let errorMessage = '';

    if (!categoryId?.value) {
      categoryId?.markAsTouched();
      errorMessage = 'Please select a category';
      isValid = false;
    }

    if (isValid && !difficulty?.value) {
      difficulty?.markAsTouched();
      errorMessage = 'Please select a difficulty level';
      isValid = false;
    }

    if (isValid && !country?.value) {
      country?.markAsTouched();
      errorMessage = 'Please select a country';
      isValid = false;
    }

    if (!isValid) {
      this.snackBar.open(errorMessage, 'Close', { duration: 3000 });
    }

    return isValid;
  }

  private validateStep4(): boolean {
    // Step 4 is optional (video upload), so it's always valid
    return true;
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
    this.ingredients.push(this.fb.control('', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]));
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
    if (this.validateCurrentStep()) {
      if (this.currentStep < 4) {
        this.currentStep++;
        this.scrollToTop();
      }
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
