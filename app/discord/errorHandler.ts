export type DiscordErrorResponse = {
  error: string;
  message: string;
};

type DiscordErrorLike = {
  code?: number;
  message?: string;
};

function getDiscordErrorLike(error: unknown): DiscordErrorLike {
  if (typeof error !== "object" || error === null) {
    return {};
  }

  return error as DiscordErrorLike;
}

export function classifyDiscordError(error: unknown): DiscordErrorResponse {
  console.error("Discord notification error:", error);
  const discordError = getDiscordErrorLike(error);

  // Permission errors
  if (
    discordError.code === 50013 ||
    discordError.message?.includes("Missing Permissions")
  ) {
    return {
      error: "MISSING_PERMISSIONS",
      message:
        "The bot doesn't have permission to post in this Discord channel. Please ensure the bot has 'Send Messages', 'View Channel', and 'Manage Messages' permissions in the channel.",
    };
  }

  // Access errors (private channels, DMs)
  if (
    discordError.code === 50001 ||
    discordError.message?.includes("Missing Access")
  ) {
    return {
      error: "MISSING_ACCESS",
      message:
        "The bot cannot access this Discord channel. This often happens when the command is used in a private/DM channel. Please use the command in a server channel where the bot is a member.",
    };
  }

  // Generic error
  return {
    error: "DISCORD_ERROR",
    message: `Discord notification failed: ${discordError.message || "Unknown error"}`,
  };
}
