
import dotenv from 'dotenv';

dotenv.config();

const requiredVars = [
    "DISCORD_TOKEN",
    "DISCORD_CLIENT_ID",
    "SOFI_MIN_EVENT_DROPS",
    "SOFI_MAX_EVENT_DROPS",
    "SOFI_CATEGORY_ID",
    "SOFI_EVENT_DROPS_LOGS_CHANNEL_ID",
] as const;

for (const varName of requiredVars) {
    if (!process.env[varName]) throw new Error(`Missing environment variable: ${varName}`);
}

export const config = Object.fromEntries(
    requiredVars.map((key) => [key, process.env[key] as string])
) as Record<(typeof requiredVars)[number], string>;
