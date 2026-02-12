"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.organizationService = void 0;
const database_1 = require("../../config/database");
exports.organizationService = {
    async listForUser(userId) {
        const memberships = await database_1.prisma.membership.findMany({
            where: { userId, deletedAt: null },
            include: {
                organization: { select: { id: true, name: true, slug: true, deletedAt: true } }
            }
        });
        return memberships
            .map((m) => m.organization)
            .filter((o) => o != null && o.deletedAt == null)
            .map((o) => ({ id: o.id, name: o.name, slug: o.slug }));
    }
};
