import { Elysia, t } from "elysia";
import { swagger } from "@elysiajs/swagger";
import Database from "bun:sqlite";

import { getDIPlugin } from "./dependencies.js";
import { signup } from "./handlers.js";
import {
  get_create_user_fn,
  get_find_user_fn,
  get_find_user_by_nickname_fn,
  get_create_picture_fn,
  get_delete_picture_fn,
  get_update_picture_fn,
  get_find_pictures_for_user_fn,
  migrate,
} from "./database.js";
import { PictureService, UserService } from "./types.js";

const diPlugin = await getDIPlugin(async () => {
  const dbName = Bun.env.DB_NAME;
  const db = new Database(dbName, { create: true });

  await migrate(db);

  const user_service: UserService = {
    create_user: get_create_user_fn(db),
    find_user: get_find_user_fn(db),
    find_user_by_nickname: get_find_user_by_nickname_fn(db),
  };
  const picture_service: PictureService = {
    create_picture: get_create_picture_fn(db),
    delete_picture: get_delete_picture_fn(db),
    find_pictures_for_user: get_find_pictures_for_user_fn(db),
    update_picture: get_update_picture_fn(db),
  };

  return [user_service, picture_service];
});

const app = new Elysia()
  .use(diPlugin)
  .use(swagger())
  .post("/signup", signup, {
    body: t.Object({
      name: t.String(),
      nickname: t.String({ minLength: 3, title: "nickname" }),
      password: t.String({
        minLength: 8,
        title: "password",
        pattern: '^.*(?=.{6,})(?=.*[a-zA-Z])(?=.*d)(?=.*[!#$%&? "]).*$',
        default: "",
        description:
          "Must contain at least 6 characters, one letter, one number and one special character",
      }),
    }),
  })
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
