import { ObjectManager } from "@netsnek/prisma-repository";

import { client } from "../client";
import { OAuthAppRepository } from "../.generated";
import { requireAuth } from "@cronitio/pylon";
import service from "../../";
import { $Enums } from "@prisma/client";

export class OAuthApp extends OAuthAppRepository {
  static objects = new ObjectManager<"OAuthApp", typeof OAuthApp>(
    client.oAuthApp,
    OAuthApp
  );

  // Custom logic here...

  @requireAuth({
    roles: ["mailpress:admin"],
  })
  static async create(
    clientId: string,
    clientSecret: string,
    type: $Enums.OAuthProvider
  ) {
    const ctx = await service.getContext(this);

    const user = ctx.user!;

    return await OAuthApp.objects.create({
      clientId,
      clientSecret,
      type,
      organizationId: user.$organizationId,
    });
  }

  @requireAuth({
    roles: ["mailpress:admin"],
  })
  static async delete(id: string) {
    const ctx = await service.getContext(this);

    return await OAuthApp.objects.delete({
      id,
      organizationId: ctx.user!.$organizationId,
    });
  }
}
