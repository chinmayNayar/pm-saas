"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsController = void 0;
const analytics_service_1 = require("../../services/analytics.service");
const apiResponse_1 = require("../../utils/apiResponse");
class AnalyticsController {
    async dashboard(req, res, next) {
        try {
            const ctx = req.authContext;
            const data = await analytics_service_1.analyticsService.getDashboardAnalytics(ctx);
            return (0, apiResponse_1.ok)(res, data);
        }
        catch (err) {
            next(err);
        }
    }
}
exports.analyticsController = new AnalyticsController();
