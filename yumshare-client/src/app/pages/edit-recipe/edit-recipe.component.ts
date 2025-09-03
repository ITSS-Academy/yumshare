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
import { RecipeService } from '../../services/recipe/recipe.service';
import { Category } from '../../models/category.model';
import { Recipe } from '../../models/recipe.model';
import { RecipeStep } from '../../models/recipe-step.model';
import { PaginatedResponse } from '../../models/paginated-response.model';

import { AuthModel } from '../../models/auth.model';
import { AuthState } from '../../ngrx/auth/auth.state';
import { SafePipe } from '../../pipes/safe.pipe';

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
    SafePipe
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
  currentUser: AuthModel | null = null;

  currentStep: number = 1;
  // Subscriptions management
  private subscriptions: Subscription[] = [];

  constructor(
    private recipeService: RecipeService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<{auth: AuthState}>,
    private cdr: ChangeDetectorRef
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
    this.loadCurrentUser();
    this.loadRecipe();
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
    return this.recipeForm.get('ingredients') as FormArray;
  }

  get steps() {
    return this.recipeForm.get('steps') as FormArray;
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

  // TrackBy function for steps to force template update
  trackByStep(index: number, item: any): any {
    return item?.value?.step_number || index;
  }

  // Method to sync stepsData with FormArray
  syncStepsWithFormArray() {
    // Clear existing FormArray
    this.steps.clear();
    
    // Rebuild FormArray from stepsData
    this.stepsData.forEach((step, index) => {
      this.steps.push(this.fb.group({
        step_number: [step.step_number || index + 1],
        description: [step.description, Validators.required],
        cooking_time: [step.cooking_time || 0],
        tips: [step.tips || '']
      }));
    });
  }

  // Handle step description change
  onStepDescriptionChange(index: number, value: string) {
    if (this.stepsData[index]) {
      this.stepsData[index].description = value;
    }
  }

  // Debug method to check form validation status
  private logFormValidationStatus() {
 
    
    // Log each step validation
    this.steps.controls.forEach((step, index) => {
      console.log(`Step ${index + 1} valid:`, step.valid);
      console.log(`Step ${index + 1} errors:`, step.errors);
    });
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
      } else {
          console.warn('No categories found from API');
          this.categories = [
            { id: '1', name: 'Vietnamese Cuisine', image_url: '', is_active: true, sort_order: 1, created_at: new Date(), updated_at: new Date() },
            { id: '2', name: 'Asian Cuisine', image_url: '', is_active: true, sort_order: 2, created_at: new Date(), updated_at: new Date() },
            { id: '3', name: 'Western Cuisine', image_url: '', is_active: true, sort_order: 3, created_at: new Date(), updated_at: new Date() }
          ];
        }
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.categories = [
          { id: '1', name: 'Vietnamese Cuisine', image_url: '', is_active: true, sort_order: 1, created_at: new Date(), updated_at: new Date() },
          { id: '2', name: 'Asian Cuisine', image_url: '', is_active: true, sort_order: 2, created_at: new Date(), updated_at: new Date() },
          { id: '3', name: 'Western Cuisine', image_url: '', is_active: true, sort_order: 3, created_at: new Date(), updated_at: new Date() }
        ];
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

  loadRecipe() {
    if (!this.recipeId) return;
    
    this.loading = true;
    const recipeSubscription = this.recipeService.getRecipeById(this.recipeId).subscribe({
      next: (recipe: Recipe) => {
        this.originalRecipe = recipe;
        this.populateForm(recipe);
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading recipe:', error);
        this.snackBar.open('Failed to load recipe', 'Close', { duration: 3000 });
        this.loading = false;
        this.router.navigate(['/']);
      }
    });
    
    this.subscriptions.push(recipeSubscription);
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

    // Clear and populate ingredients
    this.ingredients.clear();
    if (recipe.ingredients && recipe.ingredients.length > 0) {
      recipe.ingredients.forEach(ingredient => {
        this.ingredients.push(this.fb.control(ingredient, Validators.required));
      });
    } else {
      this.ingredients.push(this.fb.control('', Validators.required));
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
            description: [step.description, Validators.required],
            cooking_time: [step.cooking_time || 0],
            tips: [step.tips || '']
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
    
    // Also update stepsData to keep UI in sync
    this.stepsData.push({
      step_number: stepNumber,
      description: '',
      cooking_time: 0,
      tips: ''
    });
    
    // Force change detection
    this.cdr.detectChanges();
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

  onYoutubeUrlChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const url = target.value;
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
      return `${hours} hour${hours > 1 ? 's' : ''} ${mins} minute${mins > 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    } else {
      return `${mins} minute${mins > 1 ? 's' : ''}`;
    }
  }

  // Image event handlers
  onImageLoad() {
    // Image loaded successfully
  }

  onImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    // Use data URI instead of external placeholder
    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkZhaWxlZCB0byBMb2FkPC90ZXh0Pjwvc3ZnPg==';
  }

  onImageClick() {
    this.imageInput.nativeElement.click();
  }

  nextStep() {
    if (this.currentStep < 4) {
      this.currentStep++;
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
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
    if (!this.currentUser) {
      this.snackBar.open('Please login to edit recipe', 'Close', { duration: 3000 });
      return;
    }

    if (!this.recipeId) {
      this.snackBar.open('Recipe ID not found', 'Close', { duration: 3000 });
      return;
    }
    
    // Sync stepsData with FormArray before validation
    this.syncStepsWithFormArray();
    
    // Debug: Log validation status
    this.logFormValidationStatus();
    
    // Check if stepsData has valid descriptions
    const hasValidSteps = this.stepsData.length > 0 && 
                         this.stepsData.every(step => step.description && step.description.trim() !== '');
    
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


        
        // Update recipe
        const response = await this.recipeService.updateRecipeWithFiles(this.recipeId, formData).toPromise();
        
        this.snackBar.open('Recipe updated successfully!', 'Close', { duration: 3000 });
        this.router.navigate(['/recipe', this.recipeId]);
        
      } catch (error) {
        console.error('Error updating recipe:', error);
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

  onDelete() {
    if (!this.recipeId) return;
    
    if (confirm('Are you sure you want to delete this recipe? This action cannot be undone.')) {
      this.recipeService.deleteRecipe(this.recipeId).subscribe({
        next: () => {
          this.snackBar.open('Recipe deleted successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/']);
        },
        error: (error) => {
          console.error('Error deleting recipe:', error);
          this.snackBar.open('Error deleting recipe', 'Close', { duration: 3000 });
        }
      });
    }
  }
}
