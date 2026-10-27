# Bot de Discord para datos de vinculación

Este repositorio no contiene actualmente una página web ni un formulario. El bot se mantiene separado en `bot/` y solo muestra al usuario su propio ID y nombre de Discord en una respuesta efímera. No genera códigos, no verifica cuentas y no envía datos al backend de una web.

## Requisitos

- Node.js 22.12 o posterior (probado para desarrollo con Node.js 24).
- Una aplicacion y un bot creados en [Discord Developer Portal](https://discord.com/developers/applications).
- Permisos para invitar el bot y registrar comandos en el servidor objetivo.

## Instalación y configuración

Desde la raiz del proyecto, en PowerShell:

```powershell
cd bot
npm.cmd install
Copy-Item .env.example .env
```

Edita `bot/.env` localmente y completa:

- `DISCORD_BOT_TOKEN`: token secreto del bot. No lo compartas ni lo incluyas en el código.
- `DISCORD_CLIENT_ID`: Application ID de la aplicacion.
- `DISCORD_GUILD_ID`: ID del servidor donde se registrará el comando durante el desarrollo.
- `DISCORD_LINK_CHANNEL_ID`: ID del canal de texto `#vinculación` donde aparecerá el mensaje público.

Para obtener un ID, activa **Discord > Ajustes de usuario > Avanzado > Modo desarrollador** y usa el menú contextual **Copiar ID** del servidor y del canal. El Application ID y el token están en Developer Portal > **General Information** y **Bot**, respectivamente. El token solo se introduce en el archivo `.env` local; nunca se solicita ni se pega en Copilot.

## Invitar el bot

En Developer Portal > **OAuth2 > URL Generator**, selecciona los scopes `bot` y `applications.commands`. Concede solamente estos permisos del bot:

- View Channels
- Send Messages
- Read Message History

El bot no necesita intents privilegiados ni permisos de administrador. Abre la URL generada, elige el servidor indicado por `DISCORD_GUILD_ID` y autoriza la invitacion. El usuario que autoriza necesita permiso para administrar el servidor.

## Registrar y ejecutar

Desde `bot/`, registra o actualiza el comando limitado al servidor configurado:

```powershell
npm.cmd run deploy
```

Inicia el bot normalmente:

```powershell
npm.cmd start
```

Para desarrollo con reinicio automático al cambiar archivos:

```powershell
npm.cmd run dev
```

En Discord, un administrador del servidor ejecuta `/publicar-vinculacion`. El comando crea el mensaje en el canal configurado o edita el mensaje previamente registrado. El ID del mensaje se guarda en `bot/data/link-message.json`, un archivo local ignorado por Git. Si ese mensaje fue borrado en Discord, el comando informa del problema en vez de crear duplicados; elimina ese archivo local solo si deseas iniciar deliberadamente un mensaje nuevo.

Pulsa **Ayuda para vincularse** para recibir en privado tu ID y nombre de usuario. Para probar privacidad, dos usuarios pueden pulsar el botón: cada respuesta efímera se construye a partir del usuario de su propia interacción y no se publica en el canal.

## Pruebas

```powershell
npm.cmd test
```

Las pruebas no se conectan a Discord y no necesitan credenciales. Para detener el bot, usa `Ctrl+C`.

## Alcance y privacidad

El bot solo revela al usuario su ID de Discord y su nombre de usuario; el mensaje público no contiene datos personales. El usuario copia esos datos en el formulario web existente. Mostrar estos datos **no demuestra la propiedad de la cuenta**. Como no hay una web en este repositorio, no se ha cambiado ni integrado ningún formulario. Si la web necesita verificar de forma segura que el usuario controla la cuenta, Discord OAuth2 (flujo de autorización con validación en el backend) sería una alternativa; no forma parte de este flujo.
