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
import { CategoryService } from '../../services/category/category.service';
import { User } from '../../models/user.model';
import * as AuthSelectors from '../../ngrx/auth/auth.selectors';

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

  // Subscriptions management
  private subscriptions: Subscription[] = [];

  constructor(
    private recipeService: RecipeService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private store: Store<{auth: AuthState}>,
    private categoryService: CategoryService
  ) {
    this.recipeForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      servings: [1, [Validators.required, Validators.min(1)]],
      total_cooking_time: [90, Validators.required], // Default 1 hour 30 minutes
      difficulty: ['Medium', Validators.required],
      country: ['Vietnam', Validators.required],
      category_id: ['', Validators.required], // Will be set after categories are loaded
      ingredients: this.fb.array([
        this.fb.control('', Validators.required)
      ]),
      steps: this.fb.array([
        this.createStepFormGroup(1)
      ])
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
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
  }

  removeIngredient(index: number) {
    if (this.ingredients.length > 1) {
    this.ingredients.removeAt(index);
    }
  }

  addStep() {
    const stepNumber = this.steps.length + 1;
    this.steps.push(this.createStepFormGroup(stepNumber));
  }

  removeStep(index: number) {
    if (this.steps.length > 1) {
    this.steps.removeAt(index);
      // Reorder step numbers
      this.steps.controls.forEach((control, i) => {
        control.patchValue({ step_number: i + 1 });
      });
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
      // Create video preview
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
    // Extract video ID from YouTube URL for preview
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
    const categoriesSubscription = this.categoryService.getCategories().subscribe({
      next: (response: any) => {
        
        let categories: Category[] = [];
        
        // Handle different response formats
        if (Array.isArray(response)) {
          // Direct array response
          categories = response;
        } else if (response && response.data && Array.isArray(response.data)) {
          // Paginated response with data property
          categories = response.data;
        } else if (response && typeof response === 'object') {
        }
        
        if (categories && categories.length > 0) {
          this.categories = categories;
          
          // Always set the first category as default since form starts empty
          this.recipeForm.patchValue({ category_id: categories[0].id });
        } else {
          console.warn('No categories found from API');
          console.warn('Response was:', response);
          
          // Fallback: Use basic categories for testing
          this.categories = [
            { id: 'fallback-1', name: 'Vietnamese Cuisine', image_url: '', is_active: true, sort_order: 1, created_at: new Date(), updated_at: new Date() },
            { id: 'fallback-2', name: 'Asian Cuisine', image_url: '', is_active: true, sort_order: 2, created_at: new Date(), updated_at: new Date() },
            { id: 'fallback-3', name: 'Western Cuisine', image_url: '', is_active: true, sort_order: 3, created_at: new Date(), updated_at: new Date() }
          ];
          this.snackBar.open('Using fallback categories - Check API connection', 'Close', { duration: 5000 });
          
          // Set default category for fallback
          this.recipeForm.patchValue({ category_id: 'fallback-1' });
        }
      },
      error: (error) => {
        console.error('Error loading categories from API:', error);
        console.error('Error details:', error);
        
        // Fallback: Use basic categories for testing when API fails
        this.categories = [
          { id: 'fallback-1', name: 'Vietnamese Cuisine', image_url: '', is_active: true, sort_order: 1, created_at: new Date(), updated_at: new Date() },
          { id: '2', name: 'Asian Cuisine', image_url: '', is_active: true, sort_order: 2, created_at: new Date(), updated_at: new Date() },
          { id: 'fallback-3', name: 'Western Cuisine', image_url: '', is_active: true, sort_order: 3, created_at: new Date(), updated_at: new Date() }
        ];
        this.snackBar.open('API Error - Using fallback categories', 'Close', { duration: 5000 });
        
        // Set default category for error fallback
        this.recipeForm.patchValue({ category_id: 'fallback-1' });
      }
    });
    
    // Add subscription to array
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
    // Ensure category has a default value after categories are loaded
    if (this.categories.length > 0 && !this.recipeForm.get('category_id')?.value) {
      this.recipeForm.patchValue({ category_id: this.categories[0].id });
      console.log('EnsureDefaultValues: Set category to', this.categories[0].id);
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
        // Create recipe with files using the backend endpoint
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
        formData.append('user_id', this.mineProfile?.id || 'anonymous-user'); // Get from mine profile
        
        // Add ingredients as JSON string
        formData.append('ingredients', JSON.stringify(recipeData.ingredients));
        
        // Add steps as JSON string
        formData.append('steps', JSON.stringify(recipeData.steps));
        
        // Add image (file only)
        console.log('Selected image:', this.selectedImage);
        
        if (this.selectedImage) {
          formData.append('image', this.selectedImage);
          console.log('Added image file to FormData');
        } else {
          console.log('No image added to FormData');
        }
        
        // Add video (file or YouTube URL)
        console.log('Video type:', this.videoType);
        console.log('YouTube URL:', this.youtubeUrl);
        console.log('Selected video:', this.selectedVideo);
        
        if (this.videoType === 'file' && this.selectedVideo) {
          formData.append('video', this.selectedVideo);
          console.log('Added video file to FormData');
        } else if (this.videoType === 'youtube' && this.youtubeUrl) {
          formData.append('video_url', this.youtubeUrl);
          console.log('Added video_url to FormData:', this.youtubeUrl);
        } else {
          console.log('No video added to FormData');
        }

        console.log("FormData contents:");
        for (let [key, value] of formData.entries()) {
          console.log(`${key}:`, value);
        }

        // Send to backend
        const response = await this.recipeService.createRecipeWithFiles(formData).toPromise();
        console.log("Response", response);
        this.snackBar.open('Recipe created successfully!', 'Close', { duration: 3000 });
        this.resetForm();
        
      } catch (error) {
        console.error('Error creating recipe:', error);
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
    
    // Reset arrays
    this.ingredients.clear();
    this.steps.clear();
    this.ingredients.push(this.fb.control('', Validators.required));
    this.steps.push(this.createStepFormGroup(1));
    
    // Reset files
    this.selectedImage = null;
    this.selectedVideo = null;
    this.imagePreview = null;
    this.videoPreview = null;
    this.youtubeUrl = '';
    this.videoType = 'file';
    
    // Reset step
    this.currentStep = 1;
  }

  onDelete() {
    if (confirm('Are you sure you want to delete this recipe? All unsaved changes will be lost.')) {
      this.resetForm();
    }
  }

  // Grid Multi-step navigation methods
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
    // Smooth scroll to top of the page with offset for sticky header
    const headerHeight = 120; // Approximate height of progress header
    window.scrollTo({
      top: headerHeight,
      behavior: 'smooth'
    });
    
    // Alternative: scroll to the add-recipe container with proper offset
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
    // Reset video preview when switching types
    this.videoPreview = null;
    this.selectedVideo = null;
    this.youtubeUrl = '';
  }
}
