import { prisma } from "../../infra/db/prisma";
import { UserDataDTO } from "../../shared/DTO/authDTO";

export async function onboardUser() : Promise<UserDataDTO> {
  const user = await prisma.user.create({
    data: {
      apikey: crypto.randomUUID(),
    },
  });
  
  return new UserDataDTO(user.id, user.apikey, user.createdAt);
}