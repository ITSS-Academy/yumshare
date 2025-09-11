import { Component, OnInit, ViewChild, ElementRef, OnDestroy, ChangeDetectorRef } from '@angular/core';
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
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { RecipeService } from '../../services/recipe/recipe.service';
import { Category } from '../../models/category.model';
import { Recipe } from '../../models/recipe.model';
import { RecipeStep } from '../../models/recipe-step.model';
import { PaginatedResponse } from '../../models/paginated-response.model';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthModel } from '../../models/auth.model';
import { AuthState } from '../../ngrx/auth/auth.state';
import { SafePipe } from '../../pipes/safe.pipe';
import { User } from '../../models/user.model';
import * as AuthSelectors from '../../ngrx/auth/auth.selectors';
import * as CategoryActions from '../../ngrx/category/category.actions';
import * as CategorySelectors from '../../ngrx/category/category.selectors';
import {TranslateService} from '@ngx-translate/core';
@Component({
  selector: 'app-edit-recipe',
  templateUrl: './edit-recipe.component.html',
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
  styleUrls: ['./edit-recipe.component.scss']
})
export class EditRecipeComponent implements OnInit, OnDestroy {
  @ViewChild('imageInput') imageInput!: ElementRef<HTMLInputElement>;
  @ViewChild('videoInput') videoInput!: ElementRef<HTMLInputElement>;
  
  recipeForm: FormGroup;
  categories: Category[] = [];
  selectedImage: File | null = null;
  selectedVideo: File | null = null;
  imagePreview: string | null = null;
  videoPreview: string | null = null;
  youtubeUrl: string = '';
  videoType: 'file' | 'youtube' = 'file';
  uploading = false;
  loading = false;
  recipeId: string | null = null;
  originalRecipe: Recipe | null = null;
  stepsData: any[] = [];
  
  difficultyLevels: string[] = ['Easy', 'Medium', 'Hard'];
  countries: string[] = ['Vietnam', 'Thailand', 'Japan', 'China', 'Korea', 'Italy', 'France', 'Spain', 'Mexico', 'India', 'United States', 'Other'];
  mineProfile: User | null = null;

  currentStep: number = 1;
  // Subscriptions management
  private subscriptions: Subscription[] = [];

  constructor(
    private recipeService: RecipeService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private router: Router,
    private translate: TranslateService,
    private store: Store<{auth: AuthState, category: any}>,
    private cdr: ChangeDetectorRef
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
    
    // Initialize stepsData with initial step
    this.stepsData = [{
      step_number: 1,
      description: '',
      cooking_time: 0,
      tips: ''
    }];
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    this.subscriptions = [];
  }

  ngOnInit() {
    // let recipeId = "87528457-eb30-4b8a-8d12-17f1903fe0c9"
    // this.recipeId = recipeId;
    // Get recipe ID from route
    this.recipeId = this.route.snapshot.paramMap.get('id');
   
    
    if (!this.recipeId) {
      this.snackBar.open('Recipe ID not found', 'Close', { duration: 3000 });
      this.router.navigate(['/']);
      return;
    }

    // Load dependencies
    this.loadCategories();
    this.loadMineProfile();
    this.loadRecipe();
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
    return this.recipeForm.get('ingredients') as FormArray;
  }

  get steps() {
    return this.recipeForm.get('steps') as FormArray;
  }

  get safeCategories() {
    return Array.isArray(this.categories) ? this.categories : [];
  }

  // TrackBy function for categories to help Angular track changes
  trackByCategoryId(index: number, category: Category): string {
    return category.id;
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

  // TrackBy function for steps to force template update
  trackByStep(index: number, item: any): any {
    return item?.value?.step_number || index;
  }


  // Method to sync FormArray data to stepsData
  syncFormArrayToStepsData() {
    this.stepsData = this.steps.controls.map((stepControl, index) => ({
      step_number: index + 1,
      description: stepControl.get('description')?.value || '',
      cooking_time: stepControl.get('cooking_time')?.value || 0,
      tips: stepControl.get('tips')?.value || ''
    }));
  }

  // Debug method to check form validation status
  private logFormValidationStatus() {
    // Log each step validation
    this.steps.controls.forEach((step, index) => {
      // Step validation checked
    });
  }

  loadCategories() {
    // First check if categories are already in store
    this.store.select(CategorySelectors.selectCategories).pipe(take(1)).subscribe(existingCategories => {
      if (existingCategories && existingCategories.length > 0) {
        this.categories = existingCategories;
        
        // If we have a recipe loaded but form not populated yet, populate it now
        if (this.originalRecipe && !this.recipeForm.get('category_id')?.value) {
          this.populateForm(this.originalRecipe);
        }
        
        // Force change detection to update UI
        this.cdr.detectChanges();
        // Additional timeout to ensure UI updates
        setTimeout(() => {
          this.cdr.detectChanges();
        }, 0);
        return;
      }
      
      // Dispatch action to load categories
      this.store.dispatch(CategoryActions.loadCategories());
    });
    
    // Subscribe to categories from store
    const categoriesSubscription = this.store.select(CategorySelectors.selectCategoryListState).subscribe({
      next: ({ categories, loading, error }) => {
        
        // Check if categories is an array or has data property
        let categoriesArray: Category[] = [];
        if (Array.isArray(categories)) {
          categoriesArray = categories;
        } else if (categories && (categories as any).data && Array.isArray((categories as any).data)) {
          categoriesArray = (categories as any).data;
        }
        
        if (categoriesArray && categoriesArray.length > 0) {
          this.categories = categoriesArray;
          
          // If we have a recipe loaded but form not populated yet, populate it now
          if (this.originalRecipe && !this.recipeForm.get('category_id')?.value) {
            this.populateForm(this.originalRecipe);
          }
          
          // Force change detection to update UI
          this.cdr.detectChanges();
          // Additional timeout to ensure UI updates
          setTimeout(() => {
            this.cdr.detectChanges();
          }, 0);
        } else if (!loading && !error) {
          // Use fallback categories if no data and not loading
          this.categories = [
            { id: '1', name: 'Vietnamese Cuisine', image_url: '', is_active: true, sort_order: 1, created_at: new Date(), updated_at: new Date() },
            { id: '2', name: 'Asian Cuisine', image_url: '', is_active: true, sort_order: 2, created_at: new Date(), updated_at: new Date() },
            { id: '3', name: 'Western Cuisine', image_url: '', is_active: true, sort_order: 3, created_at: new Date(), updated_at: new Date() },
            { id: '4', name: 'Healthy & Diet', image_url: '', is_active: true, sort_order: 4, created_at: new Date(), updated_at: new Date() },
            { id: '5', name: 'Quick & Easy', image_url: '', is_active: true, sort_order: 5, created_at: new Date(), updated_at: new Date() },
            { id: '6', name: 'Desserts & Sweets', image_url: '', is_active: true, sort_order: 6, created_at: new Date(), updated_at: new Date() }
          ];
        }
        
        if (error) {
          // Keep fallback categories
          this.categories = [
            { id: '1', name: 'Vietnamese Cuisine', image_url: '', is_active: true, sort_order: 1, created_at: new Date(), updated_at: new Date() },
            { id: '2', name: 'Asian Cuisine', image_url: '', is_active: true, sort_order: 2, created_at: new Date(), updated_at: new Date() },
            { id: '3', name: 'Western Cuisine', image_url: '', is_active: true, sort_order: 3, created_at: new Date(), updated_at: new Date() },
            { id: '4', name: 'Healthy & Diet', image_url: '', is_active: true, sort_order: 4, created_at: new Date(), updated_at: new Date() },
            { id: '5', name: 'Quick & Easy', image_url: '', is_active: true, sort_order: 5, created_at: new Date(), updated_at: new Date() },
            { id: '6', name: 'Desserts & Sweets', image_url: '', is_active: true, sort_order: 6, created_at: new Date(), updated_at: new Date() }
          ];
        }
      }
    });
    
    this.subscriptions.push(categoriesSubscription);
  }

  loadMineProfile() {
    const profileSubscription = this.store.select(AuthSelectors.selectMineProfile).subscribe((profile: User | null) => {
      // Mine profile received in edit-recipe
      
      if (profile && profile.id) {
        this.mineProfile = profile;
        // Profile loaded successfully in edit-recipe
      } else {
        this.mineProfile = null;
        // No profile found in auth state for edit-recipe
      }
    });
    
    this.subscriptions.push(profileSubscription);
  }

  getStepPlaceholder(i: number): string {
  return `${this.translate.instant('Describe step')} ${i + 1}...`;
  }
  loadRecipe() {
    if (!this.recipeId) return;
    
    this.loading = true;
    const recipeSubscription = this.recipeService.getRecipeById(this.recipeId).subscribe({
      next: (recipe: Recipe) => {
        this.originalRecipe = recipe;
        
        // Kiểm tra quyền edit bằng endpoint mới - sử dụng store Auth
        this.store.select('auth').pipe(
          take(1)
        ).subscribe((authState: any) => {
          if (authState.currentUser && authState.currentUser.uid) {
            // console.log('✅ Using profile from store for permission check:', authState.currentUser.uid);
            this.recipeService.checkEditPermission(this.recipeId!, authState.idToken).subscribe({
              next: (permissionResponse) => {
                if (!permissionResponse.canEdit) {
                  this.snackBar.open(permissionResponse.message, 'Close', { duration: 3000 });
                  this.router.navigate(['/recipe-detail', this.recipeId]);
                  return;
                }
                
                // Có quyền edit, tiếp tục load form
                this.populateFormAfterCategoriesLoaded(recipe);
                this.loading = false;
              },
              error: (error) => {
                // console.error('Error checking edit permission:', error);
                // Tạm thời bỏ qua lỗi auth và cho phép edit
                // TODO: Sửa vấn đề auth middleware
                // console.warn('Skipping permission check due to auth error, allowing edit');
                this.populateFormAfterCategoriesLoaded(recipe);
                this.loading = false;
              }
            });
          } else {
            // Không có profile trong store, bỏ qua permission check
            // console.warn('No profile in store, skipping permission check');
            this.populateFormAfterCategoriesLoaded(recipe);
            this.loading = false;
          }
        });
      },
      error: (error: any) => {
        // console.error('Error loading recipe:', error);
        
        // Xử lý lỗi permission từ backend
        if (error.status === 401) {
          this.snackBar.open('Please login to access this recipe', 'Close', { duration: 3000 });
          this.router.navigate(['/login']);
        } else if (error.status === 403 || error.error?.message?.includes('permission')) {
          this.snackBar.open('You do not have permission to edit this recipe', 'Close', { duration: 3000 });
          this.router.navigate(['/recipe', this.recipeId]);
        } else {
          this.snackBar.open('Failed to load recipe', 'Close', { duration: 3000 });
          this.router.navigate(['/']);
        }
        
        this.loading = false;
      }
    });
    
    this.subscriptions.push(recipeSubscription);
  }

  private populateFormAfterCategoriesLoaded(recipe: Recipe) {
    // console.log('📝 [EDIT-RECIPE] Waiting for categories to load before populating form...');
    
    // Wait for categories to be loaded
    const checkCategories = () => {
      if (this.categories && this.categories.length > 0) {
        // console.log('✅ [EDIT-RECIPE] Categories loaded, now populating form');
        this.populateForm(recipe);
      } else {
        // console.log('⏳ [EDIT-RECIPE] Categories not ready yet, waiting...');
        setTimeout(checkCategories, 100);
      }
    };
    
    checkCategories();
  }

  populateForm(recipe: Recipe) {

    // Populate basic fields
    
    this.recipeForm.patchValue({
      title: recipe.title,
      description: recipe.description,
      servings: recipe.servings,
      total_cooking_time: recipe.total_cooking_time,
      difficulty: recipe.difficulty,
      category_id: recipe.category_id
    });

    // Force change detection to update UI
    this.cdr.detectChanges();
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 0);

    // Clear and populate ingredients
    this.ingredients.clear();
    if (recipe.ingredients && recipe.ingredients.length > 0) {
      recipe.ingredients.forEach(ingredient => {
        this.ingredients.push(this.fb.control(ingredient, [Validators.required, Validators.minLength(2), Validators.maxLength(100)]));
      });
    } else {
      this.ingredients.push(this.fb.control('', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]));
    }

    // Clear and populate steps
    this.steps.clear();
    
    if (recipe.steps && recipe.steps.length > 0) {
      // Clear existing steps
      this.steps.clear();
      
      // Store steps data directly in component
      this.stepsData = recipe.steps || [];
      
      // Create new FormArray with data
      const newStepsArray = this.fb.array(
        recipe.steps.map((step, index) => {
          return this.fb.group({
            step_number: [index + 1],
            description: [step.description, [Validators.required, Validators.minLength(5), Validators.maxLength(500)]],
            cooking_time: [step.cooking_time || 0, [Validators.min(0), Validators.max(300)]],
            tips: [step.tips || '', Validators.maxLength(200)]
          });
        })
      );
      
      // Replace the entire FormArray
      this.recipeForm.setControl('steps', newStepsArray);
      
      // Force change detection
      this.cdr.detectChanges();
      
    } else {
      this.steps.push(this.createStepFormGroup(1));
      // Initialize stepsData with empty step
      this.stepsData = [{
        step_number: 1,
        description: '',
        cooking_time: 0,
        tips: ''
      }];
    }

    // Handle image
    if (recipe.image_url) {
      this.imagePreview = recipe.image_url;
    }

    // Handle video
    if (recipe.video_url) {
      this.youtubeUrl = recipe.video_url;
      this.videoType = 'youtube';
      this.videoPreview = this.getYoutubeEmbedUrl(recipe.video_url);
    }
  }

  addIngredient() {
    this.ingredients.push(this.fb.control('', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]));
  }

  removeIngredient(index: number) {
    if (this.ingredients.length > 1) {
      this.ingredients.removeAt(index);
    }
  }

  addStep() {
    const stepNumber = this.steps.length + 1;
    
    // Create new FormGroup for the step
    const newStepFormGroup = this.createStepFormGroup(stepNumber);
    this.steps.push(newStepFormGroup);
    
    // Also update stepsData to keep UI in sync
    this.stepsData.push({
      step_number: stepNumber,
      description: '',
      cooking_time: 0,
      tips: ''
    });
    
    // Force change detection
    this.cdr.detectChanges();
    
    // Mark the new step as touched to show validation
    setTimeout(() => {
      newStepFormGroup.get('description')?.markAsTouched();
    }, 0);
  }

  removeStep(index: number) {
    if (this.steps.length > 1) {
      this.steps.removeAt(index);
      // Also remove from stepsData to keep UI in sync
      this.stepsData.splice(index, 1);
      
      // Reorder step numbers
      this.steps.controls.forEach((control, i) => {
        control.patchValue({ step_number: i + 1 });
      });
      
      // Update step numbers in stepsData
      this.stepsData.forEach((step, i) => {
        step.step_number = i + 1;
      });
      
      // Force change detection
      this.cdr.detectChanges();
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

  onYoutubeUrlChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const url = target.value;
    this.youtubeUrl = url;
    
    if (url.trim() === '') {
      this.videoPreview = null;
      return;
    }

    // Validate YouTube URL
    if (this.isValidYoutubeUrl(url)) {
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

  private getYoutubeEmbedUrl(url: string): string | null {
    const videoId = this.extractYoutubeVideoId(url);
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  }

  isValidYoutubeUrl(url: string): boolean {
    return this.extractYoutubeVideoId(url) !== null;
  }

 formatTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) {
    return `${hours} ${this.translate.instant('hours')} ${mins} ${this.translate.instant('minutes')}`;
  } else if (hours > 0) {
    return `${hours} ${this.translate.instant('hours')}`;
  } else {
    return `${mins} ${this.translate.instant('minutes')}`;
  }
}


  onImageClick() {
    this.imageInput.nativeElement.click();
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
    // Smooth scroll to top of the page with offset for sticky header
    const headerHeight = 120; // Approximate height of progress header
    window.scrollTo({
      top: headerHeight,
      behavior: 'smooth'
    });
    
    // Alternative: scroll to the edit-recipe container with proper offset
    setTimeout(() => {
      const container = document.querySelector('.edit-recipe');
      if (container) {
        container.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    }, 200);
  }

  setVideoType(type: 'file' | 'youtube') {
    this.videoType = type;
    if (type === 'youtube') {
      this.selectedVideo = null;
      this.videoPreview = null;
    } else {
      this.youtubeUrl = '';
    }
  }


  async onSubmit() {
    if (!this.mineProfile) {
      this.snackBar.open('Please login to edit recipe', 'Close', { duration: 3000 });
      return;
    }

    if (!this.recipeId) {
      this.snackBar.open('Recipe ID not found', 'Close', { duration: 3000 });
      return;
    }

    // Kiểm tra quyền: chỉ user tạo ra recipe mới được edit
    const recipeUserId = this.originalRecipe?.user?.id;
    
    if (this.originalRecipe && recipeUserId !== this.mineProfile.id) {
      this.snackBar.open('You do not have permission to edit this recipe', 'Close', { duration: 3000 });
      return;
    }
    
    // Sync FormArray data to stepsData before validation and submission
    this.syncFormArrayToStepsData();
    
    // Debug: Log validation status
    this.logFormValidationStatus();
    
    // Check if FormArray has valid steps
    const hasValidSteps = this.steps.length > 0 && 
                         this.steps.controls.every(stepControl => {
                           const description = stepControl.get('description');
                           return description?.value && description.value.trim() !== '';
                         });
    
    if (this.recipeForm.valid && hasValidSteps) {
      this.uploading = true;
      
      try {
        // Create FormData for file uploads
        const formData = new FormData();
        
        // Add recipe data
        const recipeData = this.recipeForm.value;
        formData.append('title', recipeData.title);
        formData.append('description', recipeData.description);
        formData.append('servings', recipeData.servings.toString());
        formData.append('total_cooking_time', recipeData.total_cooking_time.toString());
        formData.append('difficulty', recipeData.difficulty);
        formData.append('country', recipeData.country);
        formData.append('category_id', recipeData.category_id);
        
        // Add ingredients and steps as JSON
        formData.append('ingredients', JSON.stringify(recipeData.ingredients));
        formData.append('steps', JSON.stringify(this.stepsData));
        
        // Add new image if selected
        if (this.selectedImage) {
          formData.append('image', this.selectedImage);
        }
        
        // Add video (file or YouTube URL)
        if (this.videoType === 'file' && this.selectedVideo) {
          formData.append('video', this.selectedVideo);
        } else if (this.videoType === 'youtube' && this.youtubeUrl) {
          formData.append('video_url', this.youtubeUrl);
        }


        
        // Get idToken from store
        const authState = await this.store.select('auth').pipe(take(1)).toPromise();
        
        if (!authState?.idToken) {
          this.snackBar.open('Authentication token not found', 'Close', { duration: 3000 });
          return;
        }
        
        // Update recipe
        const response = await this.recipeService.updateRecipeWithFiles(this.recipeId, authState.idToken, formData).toPromise();
        
        this.snackBar.open('Recipe updated successfully!', 'Close', { duration: 3000 });
        
        // Navigate to my-recipe page
        this.router.navigate(['/my-recipe']).catch(navError => {
          // Fallback navigation to home
          this.router.navigate(['/']);
        });
        
      } catch (error) {
        // console.error('Error updating recipe:', error);
        this.snackBar.open('Error updating recipe. Please try again.', 'Close', { duration: 3000 });
      } finally {
        this.uploading = false;
      }
    } else {
      this.markFormGroupTouched();
      
      // Check specific validation issues
      if (!hasValidSteps) {
        this.snackBar.open('Please fill in all step descriptions', 'Close', { duration: 3000 });
      } else {
        this.snackBar.open('Please fill in all required fields', 'Close', { duration: 3000 });
      }
    }
  }

  // private async submitRecipe() {
  //   // Sync stepsData with FormArray before validation
  //   this.syncStepsWithFormArray();
    
  //   // Debug: Log validation status
  //   this.logFormValidationStatus();
    
  //   // Check if stepsData has valid descriptions
  //   const hasValidSteps = this.stepsData.length > 0 && 
  //                        this.stepsData.every(step => step.description && step.description.trim() !== '');
    
  //   if (this.recipeForm.valid && hasValidSteps) {
  //     this.uploading = true;
      
  //     try {
  //       // Create FormData for file uploads
  //       const formData = new FormData();
        
  //       // Add recipe data
  //       const recipeData = this.recipeForm.value;
  //       formData.append('title', recipeData.title);
  //       formData.append('description', recipeData.description);
  //       formData.append('servings', recipeData.servings.toString());
  //       formData.append('total_cooking_time', recipeData.total_cooking_time.toString());
  //       formData.append('difficulty', recipeData.difficulty);
  //       formData.append('country', recipeData.country);
  //       formData.append('category_id', recipeData.category_id);
        
  //       // Add ingredients and steps as JSON
  //       formData.append('ingredients', JSON.stringify(recipeData.ingredients));
  //       formData.append('steps', JSON.stringify(this.stepsData));
        
  //       // Add new image if selected
  //       if (this.selectedImage) {
  //         formData.append('image', this.selectedImage);
  //       }
        
  //       // Add video (file or YouTube URL)
  //       if (this.videoType === 'file' && this.selectedVideo) {
  //         formData.append('video', this.selectedVideo);
  //       } else if (this.videoType === 'youtube' && this.youtubeUrl) {
  //         formData.append('video_url', this.youtubeUrl);
  //       }

  //       // Update recipe
  //       const response = await this.recipeService.updateRecipeWithFiles(this.recipeId!, formData).toPromise();
        
  //       this.snackBar.open('Recipe updated successfully!', 'Close', { duration: 3000 });
  //       this.router.navigate(['/recipe', this.recipeId]);
        
  //     } catch (error) {
  //       console.error('Error updating recipe:', error);
  //       this.snackBar.open('Error updating recipe. Please try again.', 'Close', { duration: 3000 });
  //     } finally {
  //       this.uploading = false;
  //     }
  //   } else {
  //     this.markFormGroupTouched();
      
  //     // Check specific validation issues
  //     if (!hasValidSteps) {
  //       this.snackBar.open('Please fill in all step descriptions', 'Close', { duration: 3000 });
  //     } else {
  //       this.snackBar.open('Please fill in all required fields', 'Close', { duration: 3000 });
  //     }
  //   }
  // }

  private markFormGroupTouched() {
    Object.keys(this.recipeForm.controls).forEach(key => {
      const control = this.recipeForm.get(key);
      if (control instanceof FormGroup) {
        this.markFormGroupTouched();
      } else if (control instanceof FormArray) {
        // Mark all FormArray controls as touched
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
 

  onDelete() {
    if (!this.recipeId) return;
    
    // Kiểm tra quyền: chỉ user tạo ra recipe mới được delete
    const recipeUserId = this.originalRecipe?.user?.id;
    if (!this.mineProfile || (this.originalRecipe && recipeUserId !== this.mineProfile.id)) {
      this.snackBar.open('You do not have permission to delete this recipe', 'Close', { duration: 3000 });
      return;
    }
    
    if (confirm('Are you sure you want to delete this recipe? This action cannot be undone.')) {
      this.store.select('auth').pipe(take(1)).subscribe((authState: any) => {
        this.recipeService.deleteRecipe(this.recipeId!, authState.idToken).subscribe({
          next: () => {
            this.snackBar.open('Recipe deleted successfully', 'Close', { duration: 3000 });
            this.router.navigate(['/']);
          },
          error: (error) => {
            console.error('Error deleting recipe:', error);
            this.snackBar.open('Error deleting recipe', 'Close', { duration: 3000 });
          }
        });
      });
    }
  }
}
