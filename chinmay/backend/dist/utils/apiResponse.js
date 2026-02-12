"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ok = ok;
exports.created = created;
function ok(res, data, message = "Success") {
    return res.json({ success: true, message, data });
}
function created(res, data, message = "Created") {
    return res.status(201).json({ success: true, message, data });
}
