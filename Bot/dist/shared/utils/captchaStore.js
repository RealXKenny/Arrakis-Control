"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCaptcha = createCaptcha;
exports.verifyCaptcha = verifyCaptcha;
const challenges = new Map();
function createCaptcha(userId) {
    const code = Math.random()
        .toString(36)
        .slice(2, 8)
        .toUpperCase();
    challenges.set(userId, {
        code,
        expiresAt: Date.now() + 5 * 60_000,
    });
    return code;
}
function verifyCaptcha(userId, answer) {
    const challenge = challenges.get(userId);
    challenges.delete(userId);
    return Boolean(challenge &&
        challenge.expiresAt > Date.now() &&
        challenge.code === answer.trim().toUpperCase());
}
