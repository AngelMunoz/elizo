import { Database } from "bun:sqlite";
import { readdir } from "node:fs/promises";
import { file } from "bun";
import {
  CreateUserOptions,
  DeletePictureOptions,
  InsertPictureOptions,
  Picture,
  UpdatePictureOptions,
  User,
} from "./types";

export async function migrate(db: Database) {
  const migrationsDir = "./migrations";
  const files = await readdir(migrationsDir, { encoding: "utf-8" });

  const runInTransaction = db.transaction((query: string) => {
    db.query(query).run();
  });
  for (const f of files) {
    console.log(`Running migration ${f}`);
    const found = await file(`${migrationsDir}/${f}`).text();
    runInTransaction(found);
  }
}

export function get_create_user_fn(db: Database) {
  return async function create_user(
    options: CreateUserOptions,
    hash_password: (password: string) => Promise<string>
  ) {
    const password = await hash_password(options.password);
    const query = db.query<{ id: number }, [string, string, string]>(
      "INSERT INTO users(name, nickname, password) VALUES(?, ?, ?) RETURNING id;"
    );
    const [{ id }] = query.all(options.name, options.nickname, password);
    return id;
  };
}

export function get_find_user_fn(db: Database) {
  return function find_user(id: number) {
    const query = db.query<User, [number]>("SELECT * FROM users WHERE id = ?;");
    return query.get(id);
  };
}

export function get_find_user_by_nickname_fn(db: Database) {
  return function find_user_by_nickname(nickname: string) {
    const query = db.query<User, [string]>(
      "SELECT * FROM users WHERE nickname = ?;"
    );
    return query.get(nickname);
  };
}

export function get_create_picture_fn(db: Database) {
  return function create_picture(options: InsertPictureOptions) {
    const query = db.query<number, [string, string, string | null]>(
      "INSERT INTO pictures (name, file_path, description) VALUES(?, ?, ?, ?) RETURNING id;"
    );
    const [picture_id] = query.all(
      options.name,
      options.file_path,
      options.description
    );

    const query2 = db.query<unknown, [number, number]>(
      "INSERT INTO user_pictures (user_id, picture_id) VALUES(?, ?);"
    );
    query2.run(options.user_id, picture_id);
    return picture_id;
  };
}

export function get_find_pictures_for_user_fn(db: Database) {
  return function find_pictures_for_user(user_id: number) {
    const query = db.query<Picture, [number]>(
      `SELECT p.* FROM pictures as p
      LEFT JOIN users_pictures AS up
      ON 
        up.picture_id = p.id 
      WHERE
        up.user_id = ?;`
    );
    return query.all(user_id);
  };
}

export function get_update_picture_fn(db: Database) {
  return function update_picture(options: UpdatePictureOptions) {
    const query = db.query<unknown, [string, string, string | null]>(
      "UPDATE pictures SET name = ?, file_path = ?, description = ? WHERE id = ?;"
    );
    return query.run(options.name, options.file_path, options.description);
  };
}

export function get_delete_picture_fn(db: Database) {
  return function delete_picture(options: DeletePictureOptions) {
    const q1 = db.query("DELETE FROM pictures WHERE id = ?;");
    const q2 = db.query(
      "DELETE FROM users_pictures WHERE user_id = ? AND picture_id = ?;"
    );
    db.transaction(() => {
      q1.run(options.picture_id);
      q2.run(options.user_id, options.picture_id);
    });
  };
}
