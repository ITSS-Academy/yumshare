import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Recipe } from '../../models/recipe.model';
import { Category } from '../../models/category.model';
import { RecipeStep } from '../../models/recipe-step.model';
import { PaginatedResponse } from '../../models/paginated-response.model';

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Get all categories
  getCategories(): Observable<PaginatedResponse<Category>> {
    return this.http.get<PaginatedResponse<Category>>(`${this.apiUrl}/categories`);
  }

  // Create recipe with files
  createRecipeWithFiles(recipeData: FormData): Observable<Recipe> {
    return this.http.post<Recipe>(`${this.apiUrl}/recipes/with-files`, recipeData);
  }

  // Create basic recipe
  createRecipe(recipe: Recipe): Observable<Recipe> {
    return this.http.post<Recipe>(`${this.apiUrl}/recipes`, recipe);
  }

  // Upload image for recipe
  uploadRecipeImage(recipeId: string, imageFile: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', imageFile);
    return this.http.post(`${this.apiUrl}/recipes/${recipeId}/image`, formData);
  }

  // Upload video for recipe
  uploadRecipeVideo(recipeId: string, videoFile: File): Observable<any> {
    const formData = new FormData();
    formData.append('video', videoFile);
    return this.http.post(`${this.apiUrl}/recipes/${recipeId}/video`, formData);
  }

  // Get recipe by ID
  getRecipeById(id: string): Observable<Recipe> {
    return this.http.get<Recipe>(`${this.apiUrl}/recipes/${id}`);
  }

  // Update recipe
  updateRecipe(id: string, recipe: Partial<Recipe>): Observable<Recipe> {
    return this.http.put<Recipe>(`${this.apiUrl}/recipes/${id}`, recipe);
  }

  // Update recipe with files
  updateRecipeWithFiles(id: string, recipeData: FormData): Observable<Recipe> {
    return this.http.put<Recipe>(`${this.apiUrl}/recipes/${id}/with-files`, recipeData);
  }

  // Delete recipe
  deleteRecipe(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/recipes/${id}`);
  }

  // Search recipes
  searchRecipes(query: string, category?: string, author?: string): Observable<Recipe[]> {
    let params: any = { q: query };
    if (category) params.category = category;
    if (author) params.author = author;
    
    return this.http.get<Recipe[]>(`${this.apiUrl}/recipes/search`, { params });
  }

  // Get recipes by category
  getRecipesByCategory(categoryId: string): Observable<Recipe[]> {
    return this.http.get<Recipe[]>(`${this.apiUrl}/recipes/category/${categoryId}`);
  }
}
