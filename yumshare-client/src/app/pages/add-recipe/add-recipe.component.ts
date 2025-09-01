import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';

import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, FormControl, Validators } from '@angular/forms';

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
import { ShareModule } from '../../shares/share.module';

@Component({
  selector: 'app-add-recipe',
  standalone: true,
  imports: [
  ShareModule,
    SafePipe
  ],
  templateUrl: './add-recipe.component.html',
  styleUrl: './add-recipe.component.scss'
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
  currentUser: AuthModel | null = null;

  // Subscriptions management
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
      total_cooking_time: [90, Validators.required], // Default 1 hour 30 minutes
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
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    this.subscriptions = [];
  }

  ngOnInit() {
    this.loadCategories();
    this.loadCurrentUser();
    
    // Fallback: ensure categories are loaded after a short delay
    setTimeout(() => {
      if (!this.categories || this.categories.length === 0) {
        console.log('Fallback: Loading mock categories');
        this.categories = this.getMockCategories();
      }
    }, 1000);
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
    console.log('onYoutubeUrlChange called with:', url);
    this.youtubeUrl = url;
    console.log('youtubeUrl updated to:', this.youtubeUrl);
    // Extract video ID from YouTube URL for preview
    const videoId = this.extractYoutubeVideoId(url);
    console.log('Extracted video ID:', videoId);
    if (videoId) {
      this.videoPreview = `https://www.youtube.com/embed/${videoId}`;
      console.log('Video preview set to:', this.videoPreview);
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

  async loadCategories() {
    try {
      // Try to load from API first
      const categoriesSubscription = this.recipeService.getCategories().subscribe({
        next: (response) => {
          // Handle paginated response format
          let categories: Category[] = [];
          if (response && typeof response === 'object' && 'data' in response) {
            const paginatedResponse = response as any;
            if (Array.isArray(paginatedResponse.data)) {
              categories = paginatedResponse.data;
              console.log('Extracted categories from paginated response:', categories.length);
            }
          } else if (response && Array.isArray(response)) {
            categories = response as Category[];
          }
          
          // If API returns valid data, use it
          if (categories && categories.length > 0) {
            this.categories = categories;
          } else {
            // Use mock data if API returns empty or invalid data
            this.categories = this.getMockCategories();
            console.log('Using mock categories:', this.categories.length);
            this.snackBar.open('Using mock categories data', 'Close', { duration: 3000 });
          }
          
          // Ensure categories is always an array
          if (!Array.isArray(this.categories)) {
            this.categories = this.getMockCategories();
            console.log('Fallback to mock categories:', this.categories.length);
          }
          
          console.log('Final categories count:', this.categories.length);
        },
        error: (error) => {
          console.error('Error loading categories from API:', error);
          // Use mock data if API fails
          this.categories = this.getMockCategories();
          console.log('Using mock categories due to API error:', this.categories.length);
          this.snackBar.open('Using mock categories data', 'Close', { duration: 3000 });
        }
      });
      
      // Add subscription to array
      this.subscriptions.push(categoriesSubscription);
      
    } catch (error) {
      console.error('Error in loadCategories:', error);
      // Use mock data if API fails
      this.categories = this.getMockCategories();
      console.log('Using mock categories due to error:', this.categories.length);
      this.snackBar.open('Using mock categories data', 'Close', { duration: 3000 });
    }
  }

  loadCurrentUser() {
    const authSubscription = this.store.select('auth').subscribe((authState: AuthState) => {
      if (authState.currentUser && authState.currentUser.uid) {
        this.currentUser = authState.currentUser;
      } else {
        this.currentUser = null;
      }
    });
    
    // Add subscription to array
    this.subscriptions.push(authSubscription);
  }

  private getMockCategories(): Category[] {
    return [
      {
        id: '1',
        name: 'Vietnamese Cuisine',
        image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&h=200&fit=crop',
        is_active: true,
        sort_order: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '2',
        name: 'Thai Cuisine',
        image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&h=200&fit=crop',
        is_active: true,
        sort_order: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: '3',
        name: 'Japanese Cuisine',
        image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&h=200&fit=crop',
        is_active: true,
        sort_order: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '4',
        name: 'Chinese Cuisine',
        image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&h=200&fit=crop',
        is_active: true,
        sort_order: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '5',
        name: 'Korean Cuisine',
        image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&h=200&fit=crop',
        is_active: true,
        sort_order: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '6',
        name: 'Italian Cuisine',
        image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&h=200&fit=crop',
        is_active: true,
        sort_order: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '7',
        name: 'French Cuisine',
        image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&h=200&fit=crop',
        is_active: true,
        sort_order: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '8',
        name: 'Mexican Cuisine',
        image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&h=200&fit=crop',
        is_active: true,
        sort_order: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '9',
        name: 'Indian Cuisine',
        image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&h=200&fit=crop',
        is_active: true,
        sort_order: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '10',
        name: 'Mediterranean Cuisine',
        image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&fit=crop',
        is_active: true,
        sort_order: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '11',
        name: 'American Cuisine',
        image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&h=200&fit=crop',
        is_active: true,
        sort_order: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '12',
        name: 'Desserts & Sweets',
        image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&h=200&fit=crop',
        is_active: true,
        sort_order: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '13',
        name: 'Beverages & Drinks',
        image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&h=200&fit=crop',
        is_active: true,
        sort_order: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '14',
        name: 'Vegetarian & Vegan',
        image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&h=200&fit=crop',
        is_active: true,
        sort_order: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '15',
        name: 'Quick & Easy',
        image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&h=200&fit=crop',
        is_active: true,
        sort_order: 1,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];
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
        // Create recipe with files using the backend endpoint
        const formData = new FormData();
        
        // Add recipe data
        const recipeData = this.recipeForm.value;
        formData.append('title', recipeData.title);
        formData.append('description', recipeData.description);
        formData.append('servings', recipeData.servings.toString());
        formData.append('total_cooking_time', recipeData.total_cooking_time.toString());
        formData.append('difficulty', recipeData.difficulty);
        formData.append('category_id', recipeData.category_id);
        formData.append('user_id', this.currentUser?.uid || 'anonymous-user'); // Get from auth store
        
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
      console.log("Response", response)
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
  }

  onDelete() {
    if (confirm('Are you sure you want to delete this recipe? All unsaved changes will be lost.')) {
      this.resetForm();
    }
  }
}