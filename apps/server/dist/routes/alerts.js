"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const router = (0, express_1.Router)();
// GET /api/alerts?limit=20&severity=HIGH
router.get('/', async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit) || 20, 100);
        const severity = req.query.severity;
        const alerts = await prisma_1.prisma.alert.findMany({
            where: severity ? { severity: severity } : undefined,
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
        res.json(alerts);
    }
    catch (err) {
        console.error('[alerts]', err);
        res.status(500).json({ error: 'Failed to load alerts' });
    }
});
exports.default = router;
