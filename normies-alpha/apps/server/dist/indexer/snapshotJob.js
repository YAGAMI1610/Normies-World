"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduleSnapshotJob = exports.snapshotJob = void 0;
const snapshotJob_1 = require("../jobs/snapshotJob");
Object.defineProperty(exports, "scheduleSnapshotJob", { enumerable: true, get: function () { return snapshotJob_1.scheduleSnapshotJob; } });
exports.snapshotJob = {
    start: () => (0, snapshotJob_1.scheduleSnapshotJob)(),
};
