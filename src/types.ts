import Database from "bun:sqlite";
import { t } from "elysia";

export type User = {
  id: number;
  name: string;
  nickname: string;
  password: string;
  created_at: number;
  updated_at: number;
};

export type UserDTO = Omit<User, "password" | "created_at" | "updated_at">;

export type Picture = {
  id: number;
  name: string;
  file_path: string;
  description: string | null;
  created_at: number;
  updated_at: number;
};

export type PictureDTO = Omit<
  Picture,
  "created_at" | "updated_at" | "file_path"
> & {
  url: string;
};

export type UsersPictures = {
  id: number;
  user_id: number;
  picture_id: number;
};

export type CreateUserOptions = {
  name: string;
  nickname: string;
  password: string;
};

export type InsertPictureOptions = {
  user_id: number;
  name: string;
  file_path: string;
  description: string | null;
};
export type UpdatePictureOptions = {
  name: string;
  file_path: string;
  description: string | null;
};

export type DeletePictureOptions = {
  user_id: number;
  picture_id: number;
};

// services

export type DatabaseService = {
  getDatabase: () => Database;
};

export type UserService = {
  create_user: (
    options: CreateUserOptions,
    hash_password: (password: string) => Promise<string>
  ) => Promise<number>;
  find_user: (id: number) => User | null;
  find_user_by_nickname: (nickname: string) => User | null;
};

export type PictureService = {
  create_picture: (options: InsertPictureOptions) => number;
  find_pictures_for_user: (user_id: number) => Picture[];
  update_picture: (options: UpdatePictureOptions) => void;
  delete_picture: (options: DeletePictureOptions) => void;
};
