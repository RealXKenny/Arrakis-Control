"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BLUEPRINT_LIMITS = void 0;
const BLUEPRINT_LIMITS = Object.freeze({
    maxBytes: 32 << 20,
    maxRecords: 50_000,
    maxNestingDepth: 32,
    maxObjectKeys: 2_000,
    maxStringLength: 8_192,
    minimumOfflineMs: 60_000,
});
exports.BLUEPRINT_LIMITS = BLUEPRINT_LIMITS;
