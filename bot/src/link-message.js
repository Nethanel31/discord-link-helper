import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  SlashCommandBuilder,
} from 'discord.js';

export const LINK_BUTTON_CUSTOM_ID = 'show-discord-account-details';

export const publishCommand = new SlashCommandBuilder()
  .setName('publicar-vinculacion')
  .setDescription('Publica o actualiza el mensaje de ayuda para vincular cuentas.')
  .setDefaultMemberPermissions('8');

export function createLinkMessage() {
  const button = new ButtonBuilder()
    .setCustomId(LINK_BUTTON_CUSTOM_ID)
    .setLabel('Ayuda para vincularse')
    .setStyle(ButtonStyle.Primary)
    .setEmoji('\u{1F517}');

  return {
    content: [
      '**\u{1F517} Vincula tu cuenta**',
      '',
      '¿Necesitas obtener los datos de tu cuenta de Discord para completar la vinculación en nuestra página web?',
      '',
      'Pulsa el botón para consultar tu información.',
    ].join('\n'),
    components: [new ActionRowBuilder().addComponents(button)],
  };
}

export function createPrivateAccountMessage(user) {
  return [
    '**Tus datos de Discord**',
    '',
    `ID de Discord: \`${user.id}\``,
    '',
    `Nombre de usuario: \`${user.username}\``,
    '',
    'Copia los datos en los campos correspondientes de nuestra página web para continuar.',
  ].join('\n');
}
