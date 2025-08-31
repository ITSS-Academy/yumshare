import { Component } from '@angular/core';
import {FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButton} from '@angular/material/button';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {MatOption, MatSelect} from '@angular/material/select';
import {MatStepperModule} from '@angular/material/stepper';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-add-recipe',
  templateUrl: './add-recipe.component.html',
  imports: [
    ReactiveFormsModule,
    MatFormField,
    MatButton,
    MatLabel,
    MatSelect,
    MatOption,
    MatStepperModule,
    DecimalPipe
  ],
  styleUrls: ['./add-recipe.component.scss']
})
export class AddRecipeComponent {
  recipeForm: FormGroup;
  previewUrl: string | ArrayBuffer | null = null;
  videoUrl: string = '';
  videoFile: File | null = null;
  isVideoFromUrl: boolean = false;
  videoPreviewUrl: string | null = null;

  countries = [
    { value: 'vn', viewValue: 'Vietnam' },
    { value: 'us', viewValue: 'USA' },
    { value: 'fr', viewValue: 'France' },
    { value: 'jp', viewValue: 'Japan' },
    { value: 'kr', viewValue: 'Korea' },
  ];

  difficulties = [
    { value: 'easy', viewValue: 'Easy' },
    { value: 'medium', viewValue: 'Medium' },
    { value: 'hard', viewValue: 'Hard' }
  ];

  constructor(private fb: FormBuilder) {
    this.recipeForm = this.fb.group({
      name: ['', Validators.required],
      country: ['Country', Validators.required],
      difficulty: ['Difficulty', Validators.required],
      description: ['', Validators.required],
      serving: ['', Validators.required],
      time: ['', Validators.required],
      ingredients: this.fb.array([]),
      steps: this.fb.array([]),
      videoUrl: [''],
      videoFile: [null]
    });

    // Thêm ingredient và step mặc định
    this.addIngredient();
    this.addStep();

    // Debug log
    console.log('AddRecipeComponent initialized');
    console.log('Initial isVideoFromUrl:', this.isVideoFromUrl);
  }

  get ingredients(): FormArray {
    return this.recipeForm.get('ingredients') as FormArray;
  }

  get steps(): FormArray {
    return this.recipeForm.get('steps') as FormArray;
  }

  addIngredient() {
    this.ingredients.push(this.fb.group({ name: ['', Validators.required] }));
  }

  removeIngredient(index: number) {
    this.ingredients.removeAt(index);
  }

  addStep() {
    this.steps.push(this.fb.group({ detail: ['', Validators.required] }));
  }

  removeStep(index: number) {
    this.steps.removeAt(index);
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image file size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => this.previewUrl = reader.result;
      reader.readAsDataURL(file);
    }
  }

  onVideoSelected(event: any) {
    console.log('Video file selected:', event);
    const file = event.target.files[0];
    if (file) {
      console.log('File details:', file.name, file.type, file.size);

      // Validate file type
      if (!file.type.startsWith('video/')) {
        alert('Please select a video file');
        return;
      }

      // Validate file size (max 100MB)
      if (file.size > 100 * 1024 * 1024) {
        alert('Video file size should be less than 100MB');
        return;
      }

      this.videoFile = file;
      this.isVideoFromUrl = false;
      this.videoUrl = '';
      this.videoPreviewUrl = null;
      this.recipeForm.patchValue({
        videoFile: file,
        videoUrl: ''
      });

      // Create preview URL for video
      this.videoPreviewUrl = URL.createObjectURL(file);
      console.log('Video preview URL created:', this.videoPreviewUrl);
    }
  }

  onVideoUrlChange() {
    const url = this.recipeForm.get('videoUrl')?.value;
    console.log('Video URL changed:', url);
    if (url) {
      // Basic URL validation
      if (this.isValidVideoUrl(url)) {
        console.log('Valid video URL:', url);
        this.videoUrl = url;
        this.isVideoFromUrl = true;
        this.videoFile = null;
        this.videoPreviewUrl = null;
        this.recipeForm.patchValue({ videoFile: null });
      } else {
        console.log('Invalid video URL:', url);
        alert('Please enter a valid video URL (YouTube, Vimeo, etc.)');
        this.recipeForm.patchValue({ videoUrl: '' });
      }
    } else {
      this.videoUrl = '';
      this.videoPreviewUrl = null;
    }
  }

  // Helper: chuyển YouTube URL sang embed
  getYoutubeEmbedUrl(url: string): string | null {
    let videoId = '';
    if (url.includes('youtube.com')) {
      const match = url.match(/[?&]v=([^&#]*)/);
      videoId = match ? match[1] : '';
    } else if (url.includes('youtu.be')) {
      const match = url.match(/youtu\.be\/([^?&#]*)/);
      videoId = match ? match[1] : '';
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  }

  // Helper: chuyển Vimeo URL sang embed
  getVimeoEmbedUrl(url: string): string | null {
    const match = url.match(/vimeo\.com\/(\d+)/);
    return match ? `https://player.vimeo.com/video/${match[1]}` : null;
  }

  toggleVideoSource() {
    console.log('Toggle button clicked! Current state:', this.isVideoFromUrl);
    this.isVideoFromUrl = !this.isVideoFromUrl;
    console.log('New state:', this.isVideoFromUrl);

    if (this.isVideoFromUrl) {
      // Switch to URL mode
      console.log('Switching to URL mode');
      this.videoFile = null;
      this.videoPreviewUrl = null;
      this.recipeForm.patchValue({
        videoFile: null,
        videoUrl: ''
      });
    } else {
      // Switch to file upload mode
      console.log('Switching to file upload mode');
      this.videoUrl = '';
      this.videoPreviewUrl = null;
      this.recipeForm.patchValue({
        videoUrl: '',
        videoFile: null
      });
    }
  }

  // Helper method to trigger file input click
  triggerFileUpload() {
    console.log('Trigger file upload clicked!');
    const fileInput = document.getElementById('video-upload') as HTMLInputElement;
    if (fileInput) {
      console.log('File input found, clicking...');
      fileInput.click();
    } else {
      console.log('File input not found!');
    }
  }

  // Helper method to clear video data
  clearVideoData() {
    this.videoFile = null;
    this.videoUrl = '';
    this.videoPreviewUrl = null;
    this.recipeForm.patchValue({
      videoFile: null,
      videoUrl: ''
    });
  }

  // Thêm hàm kiểm tra URL video hợp lệ
  isValidVideoUrl(url: string): boolean {
    // Kiểm tra các định dạng phổ biến: YouTube, Vimeo, mp4, mov, avi, wmv
    const youtube = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    const vimeo = /^(https?:\/\/)?(www\.)?vimeo\.com\/.+$/;
    const mp4 = /\.mp4(\?.*)?$/i;
    const mov = /\.mov(\?.*)?$/i;
    const avi = /\.avi(\?.*)?$/i;
    const wmv = /\.wmv(\?.*)?$/i;
    return youtube.test(url) || vimeo.test(url) || mp4.test(url) || mov.test(url) || avi.test(url) || wmv.test(url);
  }

  setVideoSource(isUrl: boolean) {
    this.isVideoFromUrl = isUrl;
    if (isUrl) {
      this.videoFile = null;
      this.videoPreviewUrl = null;
      this.recipeForm.patchValue({ videoFile: null });
    } else {
      this.videoUrl = '';
      this.recipeForm.patchValue({ videoUrl: '' });
      this.videoPreviewUrl = this.videoFile ? URL.createObjectURL(this.videoFile) : null;
    }
  }

  onSubmit() {
    if (this.recipeForm.valid) {
      console.log('Recipe Form:', this.recipeForm.value);
      console.log('Video File:', this.videoFile);
      console.log('Video URL:', this.videoUrl);
      console.log('Is Video from URL:', this.isVideoFromUrl);
      console.log('Video Preview URL:', this.videoPreviewUrl);

      // Here you would typically send the data to your backend
      alert('Recipe submitted successfully!');
    } else {
      alert('Please fill in all required fields');
      console.log('Form is invalid:', this.recipeForm.errors);
    }
  }
}
