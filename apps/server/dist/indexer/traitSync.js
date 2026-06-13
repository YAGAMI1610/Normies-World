"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncAllTraits = exports.traitSync = void 0;
const traitSync_1 = require("../services/traitSync");
Object.defineProperty(exports, "syncAllTraits", { enumerable: true, get: function () { return traitSync_1.syncAllTraits; } });
exports.traitSync = {
    start: () => (0, traitSync_1.syncAllTraits)(),
};
