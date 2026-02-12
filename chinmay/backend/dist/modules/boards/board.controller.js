"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.boardController = void 0;
const board_service_1 = require("./board.service");
const apiResponse_1 = require("../../utils/apiResponse");
class BoardController {
    async getOne(req, res, next) {
        try {
            const ctx = req.authContext;
            const { boardId } = req.params;
            const data = await board_service_1.boardService.getBoardForOrg(ctx.orgId, boardId);
            return (0, apiResponse_1.ok)(res, data);
        }
        catch (err) {
            next(err);
        }
    }
}
exports.boardController = new BoardController();
