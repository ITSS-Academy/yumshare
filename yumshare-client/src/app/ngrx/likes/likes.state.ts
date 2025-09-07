import {Like} from '../../models';

export interface LikesState {
  // Số lượt like theo từng recipe
  counts: { [recipeId: string]: number };

  // Trạng thái user đã like hay chưa cho từng recipe
  likedByUser: { [recipeId: string]: boolean };

  // Danh sách user đã like từng recipe (nếu cần hiển thị chi tiết)
  recipeLikes: { [recipeId: string]: Like[] };

  // Loading state
  loading: boolean;

  // Lỗi chung cho toàn bộ actions
  error: string | null;

  // Loading riêng cho từng recipe (ví dụ: toggle Like)
  toggleLoading: { [recipeId: string]: boolean };

  // Error riêng cho từng recipe
  toggleError: { [recipeId: string]: string | null };
}

export const initialLikesState: LikesState = {
  counts: {},
  likedByUser: {},
  recipeLikes: {},
  loading: false,
  error: null,
  toggleLoading: {},
  toggleError: {},
};