import {
  ChannelType,
  MessageFlags,
  PermissionFlagsBits,
} from 'discord.js';
import { createLinkMessage, createPrivateAccountMessage } from './link-message.js';
import { readMessageId, saveMessageId } from './message-store.js';

const activePublications = new Set();

function logSafeError(context, error) {
  const code = typeof error?.code === 'string' || typeof error?.code === 'number'
    ? ` (codigo ${error.code})`
    : '';
  console.error(`${context}: ${error?.name ?? 'Error'}${code}`);
}

export async function handleButton(interaction) {
  await interaction.reply({
    content: createPrivateAccountMessage(interaction.user),
    flags: MessageFlags.Ephemeral,
  });
}

export async function handlePublishCommand(interaction, client, config) {
  if (!interaction.inGuild() || interaction.guildId !== config.guildId) {
    await interaction.reply({
      content: 'Este comando solo esta disponible en el servidor configurado.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
    await interaction.reply({
      content: 'Necesitas permiso de administrador para usar este comando.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  const publicationKey = `${interaction.guildId}:${config.linkChannelId}`;
  if (activePublications.has(publicationKey)) {
    await interaction.editReply('Ya hay una publicacion en curso para este canal. Intentalo de nuevo en unos segundos.');
    return;
  }

  activePublications.add(publicationKey);
  try {
    const channel = await client.channels.fetch(config.linkChannelId);
    if (!channel || channel.type !== ChannelType.GuildText || channel.guildId !== config.guildId) {
      await interaction.editReply('No se encontro un canal de texto valido con el ID configurado en este servidor.');
      return;
    }

    const permissions = channel.permissionsFor(client.user);
    const requiredPermissions = [
      PermissionFlagsBits.ViewChannel,
      PermissionFlagsBits.SendMessages,
      PermissionFlagsBits.ReadMessageHistory,
    ];
    if (!permissions || !permissions.has(requiredPermissions, true)) {
      await interaction.editReply('Al bot le faltan permisos para ver el canal, enviar mensajes o leer su historial.');
      return;
    }

    const messageId = await readMessageId();
    const messagePayload = createLinkMessage();

    if (messageId) {
      let existingMessage;
      try {
        existingMessage = await channel.messages.fetch(messageId);
      } catch (error) {
        if (error?.code === 10008) {
          await interaction.editReply('El mensaje registrado ya no existe en Discord. No se publico otro para evitar duplicados.');
          return;
        }
        throw error;
      }

      try {
        await existingMessage.edit(messagePayload);
      } catch (error) {
        if (error?.code === 10008) {
          await interaction.editReply('El mensaje registrado ya no existe en Discord. No se publico otro para evitar duplicados.');
          return;
        }
        throw error;
      }
      await interaction.editReply('El mensaje de vinculacion existente se ha actualizado.');
      return;
    }

    const message = await channel.send(messagePayload);
    try {
      await saveMessageId(message.id);
    } catch (error) {
      logSafeError('No se pudo guardar el ID del mensaje publicado', error);
      await interaction.editReply(`El mensaje se publico con el ID ${message.id}, pero no se pudo guardar el registro local. Anota ese ID antes de volver a publicar.`);
      return;
    }

    await interaction.editReply('El mensaje de vinculacion se ha publicado.');
  } catch (error) {
    logSafeError('No se pudo publicar o actualizar el mensaje de vinculacion', error);
    if (error?.code === 10003) {
      await interaction.editReply('No se encontro el canal configurado. Comprueba DISCORD_LINK_CHANNEL_ID y que el bot pueda ver ese canal.');
    } else if (error?.code === 50001 || error?.code === 50013) {
      await interaction.editReply('Discord denego el acceso. Comprueba que el bot pueda ver, enviar mensajes y leer el historial del canal.');
    } else {
      await interaction.editReply('No se pudo completar la publicacion. Comprueba el canal configurado y los permisos del bot.');
    }
  } finally {
    activePublications.delete(publicationKey);
  }
}

export async function handleInteractionError(interaction, error) {
  logSafeError('Fallo al responder a una interaccion de Discord', error);

  try {
    if (interaction.deferred) {
      await interaction.editReply('No se pudo completar la solicitud. Intentalo de nuevo mas tarde.');
    } else if (interaction.replied) {
      await interaction.followUp({
        content: 'No se pudo completar la solicitud. Intentalo de nuevo mas tarde.',
        flags: MessageFlags.Ephemeral,
      });
    } else {
      await interaction.reply({
        content: 'No se pudo completar la solicitud. Intentalo de nuevo mas tarde.',
        flags: MessageFlags.Ephemeral,
      });
    }
  } catch (replyError) {
    logSafeError('No se pudo enviar una respuesta a la interaccion', replyError);
  }
}
