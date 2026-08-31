"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadEnvironment = loadEnvironment;
const dotenv_1 = __importDefault(require("dotenv"));
const node_path_1 = __importDefault(require("node:path"));
dotenv_1.default.config({
    path: node_path_1.default.resolve(process.cwd(), ".env"),
});
function loadEnvironment(requiredKeys = []) {
    const missingKeys = requiredKeys.filter((key) => !process.env[key]);
    if (missingKeys.length > 0) {
        throw new Error(`Missing required environment variable(s): ${missingKeys.join(", ")}`);
    }
    const discordToken = process.env.TOKEN;
    const duneConsoleUrl = process.env.CONSOLE_URL;
    const duneConsolePassword = process.env.CONSOLE_PASSWORD;
    if (!discordToken || !duneConsoleUrl || !duneConsolePassword) {
        throw new Error("Required environment variables are missing.");
    }
    const versionAnnouncementIntervalMinutes = Number(process.env.VERSION_ANNOUNCEMENT_INTERVAL_MINUTES ?? 5);
    if (!Number.isFinite(versionAnnouncementIntervalMinutes) || versionAnnouncementIntervalMinutes <= 0) {
        throw new Error("VERSION_ANNOUNCEMENT_INTERVAL_MINUTES must be a positive number.");
    }
    return Object.freeze({
        discordToken,
        clientId: process.env.CLIENT_ID,
        guildId: process.env.GUILD_ID,
        duneConsoleUrl,
        advinApiKey: process.env.API_KEY,
        advinApiUrl: process.env.API_URL ?? "https://vps.advinservers.com",
        duneConsolePassword,
        duneDiscordAdapterToken: process.env.ADAPTER_TOKEN,
        duneDiscordLinkPanelChannelId: process.env.LINK_PANEL_CHANNEL_ID,
        duneDiscordBlueprintPanelChannelId: process.env.BLUEPRINT_PANEL_CHANNEL_ID,
        duneDiscordAuditChannelId: process.env.AUDIT_CHANNEL_ID,
        duneDiscordActivityLogChannelId: process.env.ACTIVITY_LOG_CHANNEL_ID,
        discordRolePanelChannelId: process.env.ROLE_PANEL_CHANNEL_ID,
        discordVerifyChannelId: process.env.VERIFY_CHANNEL_ID,
        discordRulesChannelId: process.env.RULES_CHANNEL_ID,
        discordServerInfoChannelId: process.env.SERVER_INFO_CHANNEL_ID,
        discordAnnouncementChannelId: process.env.ANNOUNCEMENT_CHANNEL_ID,
        versionAnnouncementIntervalMinutes,
        logLevel: process.env.LOG_LEVEL ?? "INFO",
    });
}
