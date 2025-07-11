"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStatsController = void 0;
const statsSocket_1 = require("../sockets/statsSocket");
const getStatsController = (req, res) => {
    res.json((0, statsSocket_1.getStats)());
};
exports.getStatsController = getStatsController;
