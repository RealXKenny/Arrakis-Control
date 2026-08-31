import type { Collection } from "discord.js";
import type { DiscordAuditLogger } from "../modules/audit/DiscordAuditLogger";

declare module "discord.js" {
  interface Client {
    commands: Collection<string, any>;
    buttons: Collection<string, any>;
    selectMenus: Collection<string, any>;
    modals: Collection<string, any>;

    auditLogger: DiscordAuditLogger;

    auditLogInterval?: NodeJS.Timeout;
    presenceInterval?: NodeJS.Timeout;
    versionAnnouncementInterval?: NodeJS.Timeout;

    discordAdapter?: any;
    discordAdapterLinkPanelChannelId?: string;
    discordAdapterBlueprintPanelChannelId?: string;
    discordRolePanelChannelId?: string;
    discordVerifyChannelId?: string;
    discordRulesChannelId?: string;
    discordServerInfoChannelId?: string;
    discordAnnouncementChannelId?: string;

    duneApi?: any;
    convoyApi?: any;

    versionAnnouncementIntervalMinutes?: number;
  }
}