export interface ApiUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar: string;

  dob?: string;
  gender?: string;
  phone?: string;
}

export interface UsersPageResponse {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  data: ApiUser[];
}

export interface UserResponse {
  data: ApiUser;
}
