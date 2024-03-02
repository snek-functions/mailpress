import { ObjectManager } from "@netsnek/prisma-repository";
import { ServiceError, requireAuth } from "@cronitio/pylon";

import { client } from "../client";
import { EmailTemplateRepository } from "../.generated";
import service from "../../";
import { Prisma } from "@prisma/client";
import { User } from "./User";

export class EmailTemplate extends EmailTemplateRepository {
  static objects = new ObjectManager<"EmailTemplate", typeof EmailTemplate>(
    client.emailTemplate,
    EmailTemplate
  );

  @requireAuth({
    roles: ["mailpress:admin"],
  })
  static async get(id: string) {
    const ctx = await service.getContext(this);

    return EmailTemplate.objects.get({
      id,
      creator: {
        organizationId: ctx.user!.$organizationId,
      },
    });
  }

  @requireAuth({
    roles: ["mailpress:admin"],
  })
  static async all(
    pagination?: Parameters<typeof EmailTemplate.objects.paginate>[0],
    where?: Parameters<typeof EmailTemplate.objects.paginate>[1],
    orderBy?: Parameters<typeof EmailTemplate.objects.paginate>[2]
  ) {
    const ctx = await service.getContext(this);

    return EmailTemplate.objects.paginate(
      pagination,
      {
        ...where,
        creator: {
          organizationId: ctx.user!.$organizationId,
        },
      },
      orderBy
    );
  }

  @requireAuth({
    roles: ["mailpress:admin"],
  })
  static async create(data: {
    content: string;
    description: string;
    variables: {
      name: string;
      isRequired?: boolean;
      isConstant?: boolean;
      description?: string;
      defaultValue?: string;
    }[];

    envelope: {
      subject?: string;
      to?: string[];
      replyTo?: string;
    };
  }) {
    const ctx = await service.getContext(this);

    return ctx.user!.$emailTemplatesAdd({
      content: data.content,
      description: data.description,
      variables: {
        createMany: {
          data: data.variables || [],
        },
      },
      envelope: {
        create: {
          subject: data.envelope.subject,
          to: data.envelope.to,
          replyTo: data.envelope.replyTo,
        },
      },
    });
  }

  @requireAuth({
    roles: ["mailpress:admin"],
  })
  static async update(
    id: string,
    data: {
      content?: string;
      description?: string;
      variables: {
        name: string;

        isRequired?: boolean;
        isConstant?: boolean;
        description?: string;
        defaultValue?: string;
      }[];

      envelope: {
        subject?: string;
        to?: string[];
        replyTo?: string;
      };
    }
  ) {
    const ctx = await service.getContext(this);

    return EmailTemplate.objects.update(
      {
        content: data.content,
        description: data.description,
        variables: {
          createMany: {
            data: data.variables || [],
          },
        },
        envelope: {
          create: {
            subject: data.envelope.subject,
            to: data.envelope.to,
            replyTo: data.envelope.replyTo,
          },
        },
      },
      {
        id,
        creator: {
          organizationId: ctx.user!.$organizationId,
        },
      }
    );
  }

  @requireAuth({ roles: ["mailpress:unsafe-transformer"] })
  static async setTransformer(id: string, transformer: string) {
    const ctx = await service.getContext(this);

    return EmailTemplate.objects.update(
      {
        transformer,
      },
      {
        id,
        creator: {
          organizationId: ctx.user!.$organizationId,
        },
      }
    );
  }

  @requireAuth({
    roles: ["mailpress:admin"],
  })
  static async delete(id: string) {
    const ctx = await service.getContext(this);

    return EmailTemplate.objects.delete({
      id,
      creator: {
        organizationId: ctx.user!.$organizationId,
      },
    });
  }

  async creator(
    where?: Prisma.UserWhereInput | undefined,
    orderBy?:
      | Prisma.UserOrderByWithRelationInput
      | Prisma.UserOrderByWithRelationInput[]
      | undefined
  ): Promise<User> {
    const ctx = await service.getContext(this);

    // Check if userId is owned by the user
    if (this.$creatorId !== ctx.user!.id) {
      throw new ServiceError("Unauthorized", {
        code: "UNAUTHORIZED",
        statusCode: 401,
      });
    }

    return super.creator(where, orderBy);
  }
}