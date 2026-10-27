import { REST, Routes } from 'discord.js';
import { loadConfig } from './config.js';
import { publishCommand } from './link-message.js';

let config;
try {
  config = loadConfig();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

const rest = new REST({ version: '10' }).setToken(config.token);

try {
  await rest.put(
    Routes.applicationGuildCommands(config.clientId, config.guildId),
    { body: [publishCommand.toJSON()] },
  );
  console.log(`Comando de vinculacion registrado en el servidor ${config.guildId}.`);
} catch (error) {
  const code = typeof error?.code === 'string' || typeof error?.code === 'number'
    ? ` (codigo ${error.code})`
    : '';
  console.error(`No se pudo registrar el comando: ${error?.name ?? 'Error'}${code}`);
  process.exitCode = 1;
}
