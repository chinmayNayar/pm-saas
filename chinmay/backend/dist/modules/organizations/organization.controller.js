"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.organizationController = void 0;
const organization_service_1 = require("./organization.service");
const apiResponse_1 = require("../../utils/apiResponse");
class OrganizationController {
    async list(req, res, next) {
        try {
            const userId = req.user.id;
            const orgs = await organization_service_1.organizationService.listForUser(userId);
            return (0, apiResponse_1.ok)(res, orgs);
        }
        catch (err) {
            next(err);
        }
    }
}
exports.organizationController = new OrganizationController();
