import { Client, Events, GatewayIntentBits } from 'discord.js';
import { loadConfig } from './config.js';
import {
  handleButton,
  handleInteractionError,
  handlePublishCommand,
} from './handlers.js';
import { LINK_BUTTON_CUSTOM_ID } from './link-message.js';

let config;
try {
  config = loadConfig();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Bot conectado como ${readyClient.user.tag}.`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  try {
    if (interaction.isButton() && interaction.customId === LINK_BUTTON_CUSTOM_ID) {
      await handleButton(interaction);
      return;
    }

    if (interaction.isChatInputCommand() && interaction.commandName === 'publicar-vinculacion') {
      await handlePublishCommand(interaction, client, config);
    }
  } catch (error) {
    await handleInteractionError(interaction, error);
  }
});

client.on(Events.Error, (error) => {
  const code = typeof error?.code === 'string' || typeof error?.code === 'number'
    ? ` (codigo ${error.code})`
    : '';
  console.error(`Error del cliente Discord: ${error?.name ?? 'Error'}${code}`);
});

try {
  await client.login(config.token);
} catch (error) {
  const code = typeof error?.code === 'string' || typeof error?.code === 'number'
    ? ` (codigo ${error.code})`
    : '';
  console.error(`No se pudo iniciar sesion en Discord: ${error?.name ?? 'Error'}${code}`);
  process.exitCode = 1;
}
