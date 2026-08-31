"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasStaffRole = hasStaffRole;
const STAFF_ROLE_KEYS = [
    "TRIAL_STAFF_ROLE_ID",
    "MODERATOR_ROLE_ID",
    "SENIOR_MODERATOR_ROLE_ID",
    "ADMINISTRATOR_ROLE_ID",
    "HEAD_ADMINISTRATOR_ROLE_ID",
    "OWNER_ROLE_ID",
];
function hasStaffRole(member) {
    return STAFF_ROLE_KEYS
        .map((key) => process.env[key])
        .filter((roleId) => Boolean(roleId))
        .some((roleId) => member?.roles.cache.has(roleId));
}
