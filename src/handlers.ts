import { Context, NotFoundError } from "elysia";
import type { UserService } from "./types";
import { password as bun_password } from "bun";

type SignupHandler = Context & {
  user_service: UserService;
  body: {
    name: string;
    nickname: string;
    password: string;
  };
};

export async function signup({ user_service, body, set }: SignupHandler) {
  const { name, nickname, password } = body;

  const existing = user_service.find_user_by_nickname(nickname);

  if (existing) {
    set.status = 400;
    return { message: "Nickname already exists", error: "nickname_exists" };
  }

  const hash_password = (password: string) =>
    bun_password.hash(password, "bcrypt");
  const user_id = await user_service.create_user(
    { name, nickname, password },
    hash_password
  );
  return { user_id, nickname };
}
