import 'dotenv/config';

const SNOWFLAKE_PATTERN = /^\d{17,20}$/;

export function loadConfig(env = process.env) {
  const required = [
    'DISCORD_BOT_TOKEN',
    'DISCORD_CLIENT_ID',
    'DISCORD_GUILD_ID',
    'DISCORD_LINK_CHANNEL_ID',
  ];
  const missing = required.filter((name) => !env[name]?.trim());

  if (missing.length > 0) {
    throw new Error(`Faltan variables de entorno requeridas: ${missing.join(', ')}`);
  }

  for (const name of required.slice(1)) {
    if (!SNOWFLAKE_PATTERN.test(env[name].trim())) {
      throw new Error(`La variable ${name} debe ser un ID de Discord valido.`);
    }
  }

  return Object.freeze({
    token: env.DISCORD_BOT_TOKEN.trim(),
    clientId: env.DISCORD_CLIENT_ID.trim(),
    guildId: env.DISCORD_GUILD_ID.trim(),
    linkChannelId: env.DISCORD_LINK_CHANNEL_ID.trim(),
  });
}
