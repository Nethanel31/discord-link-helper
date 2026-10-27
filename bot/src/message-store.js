import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DATA_DIRECTORY = fileURLToPath(new URL('../data/', import.meta.url));
const STORE_PATH = join(DATA_DIRECTORY, 'link-message.json');

export async function readMessageId() {
  let contents;
  try {
    contents = await readFile(STORE_PATH, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }

  let record;
  try {
    record = JSON.parse(contents);
  } catch {
    throw new Error('El registro local del mensaje de vinculacion no es JSON valido.');
  }

  if (typeof record.messageId !== 'string' || !/^\d{17,20}$/.test(record.messageId)) {
    throw new Error('El registro local del mensaje de vinculacion no contiene un ID valido.');
  }

  return record.messageId;
}

export async function saveMessageId(messageId) {
  await mkdir(dirname(STORE_PATH), { recursive: true });
  const temporaryPath = `${STORE_PATH}.${process.pid}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify({ messageId }, null, 2)}\n`, {
    encoding: 'utf8',
    flag: 'w',
  });
  await rename(temporaryPath, STORE_PATH);
}
