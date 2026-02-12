"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadOrgContext = loadOrgContext;
const database_1 = require("../config/database");
function resolveOrgId(req) {
    return (req.headers["x-org-id"] ||
        req.query.orgId ||
        req.params.orgId);
}
async function loadOrgContext(req, res, next) {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const orgId = resolveOrgId(req);
        if (!orgId) {
            return res
                .status(400)
                .json({ success: false, message: "Missing organization context" });
        }
        const membership = await database_1.prisma.membership.findFirst({
            where: {
                userId: req.user.id,
                orgId,
                deletedAt: null
            }
        });
        if (!membership) {
            return res.status(403).json({
                success: false,
                message: "You do not belong to this organization"
            });
        }
        req.authContext = {
            userId: req.user.id,
            email: req.user.email,
            orgId,
            role: membership.role
        };
        next();
    }
    catch (err) {
        next(err);
    }
}
