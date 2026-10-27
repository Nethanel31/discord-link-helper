import test from 'node:test';
import assert from 'node:assert/strict';
import { loadConfig } from '../src/config.js';
import {
  createLinkMessage,
  createPrivateAccountMessage,
  LINK_BUTTON_CUSTOM_ID,
  publishCommand,
} from '../src/link-message.js';
import { handleButton } from '../src/handlers.js';
import { MessageFlags } from 'discord.js';

test('requires every configuration variable without disclosing values', () => {
  assert.throws(
    () => loadConfig({ DISCORD_BOT_TOKEN: 'never-print-this' }),
    (error) => {
      assert.match(error.message, /DISCORD_CLIENT_ID/);
      assert.doesNotMatch(error.message, /never-print-this/);
      return true;
    },
  );
});

test('validates Discord IDs and returns normalized configuration', () => {
  const config = loadConfig({
    DISCORD_BOT_TOKEN: ' local-token ',
    DISCORD_CLIENT_ID: '12345678901234567',
    DISCORD_GUILD_ID: '23456789012345678',
    DISCORD_LINK_CHANNEL_ID: '34567890123456789',
  });

  assert.equal(config.token, 'local-token');
  assert.equal(config.guildId, '23456789012345678');
  assert.throws(
    () => loadConfig({
      DISCORD_BOT_TOKEN: 'token',
      DISCORD_CLIENT_ID: 'invalid',
      DISCORD_GUILD_ID: '23456789012345678',
      DISCORD_LINK_CHANNEL_ID: '34567890123456789',
    }),
    /DISCORD_CLIENT_ID/,
  );
});

test('public message has a persistent button and no user account details', () => {
  const message = createLinkMessage();
  assert.match(message.content, /Vincula tu cuenta/);
  assert.equal(message.components[0].components[0].data.custom_id, LINK_BUTTON_CUSTOM_ID);
  assert.doesNotMatch(message.content, /\b\d{17,20}\b/);
});

test('private response is built only from the provided interaction user', () => {
  const alice = createPrivateAccountMessage({ id: '11111111111111111', username: 'alice' });
  const bob = createPrivateAccountMessage({ id: '22222222222222222', username: 'bob' });

  assert.match(alice, /11111111111111111/);
  assert.match(alice, /alice/);
  assert.doesNotMatch(alice, /22222222222222222|bob/);
  assert.match(bob, /22222222222222222/);
  assert.match(bob, /bob/);
  assert.doesNotMatch(bob, /11111111111111111|alice/);
});

test('button response is ephemeral and uses only the interaction user', async () => {
  let response;
  await handleButton({
    user: { id: '11111111111111111', username: 'alice' },
    reply: async (payload) => {
      response = payload;
    },
  });

  assert.equal(response.flags, MessageFlags.Ephemeral);
  assert.match(response.content, /11111111111111111/);
  assert.match(response.content, /alice/);
});

test('publish command requires administrator permissions by default', () => {
  assert.equal(publishCommand.default_member_permissions, '8');
});
