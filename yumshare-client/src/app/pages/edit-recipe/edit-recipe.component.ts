// src/app/pages/edit-recipe/edit-recipe.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import {MatStep, MatStepper, MatStepperPrevious} from '@angular/material/stepper';
import {DecimalPipe} from '@angular/common';

@Component({
  selector: 'app-edit-recipe',
  templateUrl: './edit-recipe.component.html',
  imports: [
    ReactiveFormsModule,
    MatFormField,
    MatButton,
    MatLabel,
    MatSelect,
    MatOption,
    MatStepper,
    MatStep,
    MatStepperPrevious,
    DecimalPipe
  ],
  styleUrls: ['./edit-recipe.component.scss']
})
export class EditRecipeComponent implements OnInit {
  recipeForm: FormGroup;
  imgURL: string | ArrayBuffer | null = null;
  originalImageUrl: string | null = null; // Ảnh gốc

  // Video state
  isVideoFromUrl = false;
  videoFile: File | null = null;
  videoUrl: string = '';
  videoPreviewUrl: string | SafeResourceUrl | null = null;

  countries = [
    {value: 'vn', viewValue: 'Vietnam'},
    {value: 'us', viewValue: 'USA'},
    {value: 'fr', viewValue: 'France'},
    {value: 'jp', viewValue: 'Japan'},
    {value: 'kr', viewValue: 'Korea'},
  ];

  difficulties = [
    {value: 'easy', viewValue: 'Easy'},
    {value: 'medium', viewValue: 'Medium'},
    {value: 'hard', viewValue: 'Hard'}
  ];

  // Dummy data để test, xóa/comment lại khi dùng thật
  recipeData: any = {
    name: 'Bánh mì Việt Nam',
    country: 'vn',
    difficulty: 'easy',
    description: 'Bánh mì Việt Nam là món ăn nổi tiếng với lớp vỏ giòn và nhân đa dạng.',
    serving: '2',
    time: '30 phút',
    ingredients: [
      {name: 'Bánh mì'},
      {name: 'Thịt nguội'},
      {name: 'Dưa leo'}
    ],
    steps: [
      {detail: 'Cắt bánh mì.'},
      {detail: 'Thêm thịt nguội và dưa leo vào bánh mì.'}
    ],
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80',
    // Để test video file: videoFile: 'https://www.w3schools.com/html/mov_bbb.mp4',
    // Để test video url: videoUrl: 'https://www.youtube.com/watch?v=ysz5S6PUM-U'
    videoUrl: 'https://www.youtube.com/watch?v=ysz5S6PUM-U'
    // videoFile: 'https://www.w3schools.com/html/mov_bbb.mp4'
  };

  constructor(private fb: FormBuilder, private sanitizer: DomSanitizer) {
    this.recipeForm = this.fb.group({
      name: [''],
      country: [''],
      difficulty: [''],
      description: [''],
      serving: [''],
      time: [''],
      ingredients: this.fb.array([]),
      steps: this.fb.array([]),
      videoUrl: [''],
      videoFile: [null]
    });
  }

  ngOnInit() {
    // Sử dụng recipeData đã khai báo ở class
    this.recipeForm.patchValue({
      name: this.recipeData.name,
      country: this.recipeData.country,
      difficulty: this.recipeData.difficulty,
      description: this.recipeData.description,
      serving: this.recipeData.serving,
      time: this.recipeData.time
    });

    // Populate ingredients
    if (this.recipeData.ingredients?.length) {
      this.recipeData.ingredients.forEach((ing: any) => {
        this.ingredients.push(this.fb.group({name: [ing.name]}));
      });
    } else {
      this.addIngredient();
    }

    // Populate steps
    if (this.recipeData.steps?.length) {
      this.recipeData.steps.forEach((step: any) => {
        this.steps.push(this.fb.group({detail: [step.detail]}));
      });
    } else {
      this.addStep();
    }

    if (this.recipeData.imageUrl) {
      this.imgURL = this.recipeData.imageUrl;
      this.originalImageUrl = this.recipeData.imageUrl;
    }

    // Video: giữ trạng thái cũ
    if (this.recipeData.videoUrl) {
      this.isVideoFromUrl = true;
      this.videoUrl = this.recipeData.videoUrl;
      this.recipeForm.patchValue({videoUrl: this.videoUrl});
      this.videoPreviewUrl = this.getVideoPreviewUrl(this.videoUrl);
      this.videoFile = null;
    } else if (this.recipeData.videoFile) {
      this.isVideoFromUrl = false;
      // Nếu là string (đường dẫn), hiển thị preview, nếu là File thì xử lý như upload
      if (typeof this.recipeData.videoFile === 'string') {
        this.videoFile = null;
        this.videoPreviewUrl = this.recipeData.videoFile;
      } else {
        this.videoFile = this.recipeData.videoFile as File;
        this.videoPreviewUrl = this.getVideoPreviewUrlFromFile(this.videoFile);
      }
      this.recipeForm.patchValue({videoFile: this.videoFile});
      this.videoUrl = '';
    }
  }

  get ingredients(): FormArray {
    return this.recipeForm.get('ingredients') as FormArray;
  }

  get steps(): FormArray {
    return this.recipeForm.get('steps') as FormArray;
  }

  // Video logic
  setVideoSource(isUrl: boolean) {
    this.isVideoFromUrl = isUrl;
    if (isUrl) {
      this.videoFile = null;
      this.videoPreviewUrl = null;
      this.recipeForm.patchValue({videoFile: null});
    } else {
      this.videoUrl = '';
      this.recipeForm.patchValue({videoUrl: ''});
      this.videoPreviewUrl = this.videoFile ? this.getVideoPreviewUrlFromFile(this.videoFile) : null;
    }
  }

  triggerFileUpload() {
    const input = document.getElementById('video-upload') as HTMLInputElement;
    if (input) input.click();
  }

  onVideoSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        alert('Please select a video file');
        return;
      }
      if (file.size > 100 * 1024 * 1024) {
        alert('Video file size should be less than 100MB');
        return;
      }
      this.videoFile = file;
      this.isVideoFromUrl = false;
      this.videoUrl = '';
      this.recipeForm.patchValue({
        videoFile: file,
        videoUrl: ''
      });
      this.videoPreviewUrl = this.getVideoPreviewUrlFromFile(file);
    }
  }

  onVideoUrlChange() {
    const url = this.recipeForm.get('videoUrl')?.value;
    if (url) {
      if (this.isValidVideoUrl(url)) {
        this.videoUrl = url;
        this.isVideoFromUrl = true;
        this.videoFile = null;
        this.recipeForm.patchValue({videoFile: null});
        this.videoPreviewUrl = this.getVideoPreviewUrl(url);
      } else {
        alert('Please enter a valid video URL (YouTube, Vimeo, etc.)');
        this.recipeForm.patchValue({videoUrl: ''});
        this.videoUrl = '';
        this.videoPreviewUrl = null;
      }
    } else {
      this.videoUrl = '';
      this.videoPreviewUrl = null;
    }
  }

  clearVideoData() {
    this.videoFile = null;
    this.videoUrl = '';
    this.videoPreviewUrl = null;
    this.recipeForm.patchValue({videoFile: null, videoUrl: ''});
  }

  isValidVideoUrl(url: string): boolean {
    const youtube = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    const vimeo = /^(https?:\/\/)?(www\.)?vimeo\.com\/.+$/;
    const mp4 = /\.mp4(\?.*)?$/i;
    const mov = /\.mov(\?.*)?$/i;
    const avi = /\.avi(\?.*)?$/i;
    const wmv = /\.wmv(\?.*)?$/i;
    return youtube.test(url) || vimeo.test(url) || mp4.test(url) || mov.test(url) || avi.test(url) || wmv.test(url);
  }

  getVideoPreviewUrl(url: string): SafeResourceUrl | null {
    if (url.match(/\.mp4$/) || url.match(/\.mov$/) || url.match(/\.avi$/) || url.match(/\.wmv$/)) {
      return url;
    } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const embed = this.getYoutubeEmbedUrl(url);
      return embed ? this.sanitizer.bypassSecurityTrustResourceUrl(embed) : null;
    } else if (url.includes('vimeo.com')) {
      const embed = this.getVimeoEmbedUrl(url);
      return embed ? this.sanitizer.bypassSecurityTrustResourceUrl(embed) : null;
    }
    return null;
  }

  getVideoPreviewUrlFromFile(file: File): string | null {
    return URL.createObjectURL(file);
  }

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

  getVimeoEmbedUrl(url: string): string | null {
    const match = url.match(/vimeo\.com\/(\d+)/);
    return match ? `https://player.vimeo.com/video/${match[1]}` : null;
  }

  isYoutubeOrVimeoEmbed(url: any): boolean {
    if (!url) return false;
    const urlStr = typeof url === 'string' ? url : url.changingThisBreaksApplicationSecurity || '';
    return urlStr.includes('youtube.com/embed') || urlStr.includes('player.vimeo.com');
  }

  addIngredient() {
    (this.recipeForm.get('ingredients') as FormArray).push(this.fb.group({name: ['']}));
  }

  removeIngredient(index: number) {
    const ingredientsArray = this.recipeForm.get('ingredients') as FormArray;
    if (ingredientsArray && index >= 0 && index < ingredientsArray.length) {
      ingredientsArray.removeAt(index);
    }
  }

  addStep() {
    (this.recipeForm.get('steps') as FormArray).push(this.fb.group({detail: ['']}));
  }

  removeStep(index: number) {
    const stepsArray = this.recipeForm.get('steps') as FormArray;
    const newSteps = stepsArray.controls.filter((_, i) => i !== index);
    stepsArray.clear();
    newSteps.forEach(ctrl => stepsArray.push(this.fb.group({detail: ctrl.value.detail})));
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => this.imgURL = reader.result;
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    const result = {
      ...this.recipeForm.value,
      originalImageUrl: this.originalImageUrl,
      editedImageUrl: this.imgURL
      // Thêm videoFile/videoUrl nếu cần gửi lên server
    }
  }
}
