import { prisma } from "../../config/database";
import { Role, TaskPriority, TaskStatus } from "@prisma/client";

function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base || "org"}-${suffix}`;
}

export const organizationService = {
  async listForUser(userId: string) {
    const memberships = await prisma.membership.findMany({
      where: { userId, deletedAt: null },
      include: {
        organization: { select: { id: true, name: true, slug: true, deletedAt: true } }
      }
    });

    return memberships
      .map((m) => m.organization)
      .filter((o) => o != null && o.deletedAt == null)
      .map((o) => ({ id: o!.id, name: o!.name, slug: o!.slug }));
  },

  async createOrganization(userId: string, name: string) {
    const org = await prisma.organization.create({
      data: {
        name,
        slug: slugify(name),
        ownerId: userId
      }
    });

    await prisma.membership.create({
      data: {
        userId,
        orgId: org.id,
        role: Role.OWNER
      }
    });

    return { id: org.id, name: org.name, slug: org.slug };
  },

  // Create an organization plus a demo project/board/columns/tasks for analytics.
  async createDemoOrganization(userId: string) {
    return prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name: "Demo Organization",
          slug: slugify("demo-organization"),
          ownerId: userId
        }
      });

      await tx.membership.create({
        data: {
          userId,
          orgId: org.id,
          role: Role.OWNER
        }
      });

      const project = await tx.project.create({
        data: {
          organizationId: org.id,
          name: "Demo Project",
          key: "DEMO",
          ownerId: userId
        }
      });

      const board = await tx.board.create({
        data: {
          organizationId: org.id,
          projectId: project.id,
          name: "Demo Board",
          position: 1
        }
      });

      const todo = await tx.column.create({
        data: { boardId: board.id, name: "To Do", position: 1 }
      });
      const inProgress = await tx.column.create({
        data: { boardId: board.id, name: "In Progress", position: 2 }
      });
      const done = await tx.column.create({
        data: { boardId: board.id, name: "Done", position: 3 }
      });

      await tx.task.createMany({
        data: [
          {
            organizationId: org.id,
            projectId: project.id,
            boardId: board.id,
            columnId: todo.id,
            title: "Set up your first project",
            status: TaskStatus.TODO,
            priority: TaskPriority.MEDIUM,
            position: 1
          },
          {
            organizationId: org.id,
            projectId: project.id,
            boardId: board.id,
            columnId: inProgress.id,
            title: "Invite your team",
            status: TaskStatus.IN_PROGRESS,
            priority: TaskPriority.HIGH,
            position: 1
          },
          {
            organizationId: org.id,
            projectId: project.id,
            boardId: board.id,
            columnId: done.id,
            title: "Welcome to your demo board",
            status: TaskStatus.DONE,
            priority: TaskPriority.LOW,
            position: 1
          }
        ]
      });

      return { id: org.id, name: org.name, slug: org.slug };
    });
  }
};
