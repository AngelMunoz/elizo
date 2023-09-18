import { Elysia } from "elysia";
import { Database } from "bun:sqlite";
import { DatabaseService, PictureService, UserService } from "./types";

export async function getDIPlugin(
  initializeServices: () => Promise<[UserService, PictureService]>
) {
  const [user_service, picture_service] = await initializeServices();
  return new Elysia({ name: "DI" })
    .decorate("user_service", user_service)
    .decorate("picture_service", picture_service);
}
