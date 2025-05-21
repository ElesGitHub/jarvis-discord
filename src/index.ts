import { GatewayIntentBits, Events, ChatInputCommandInteraction } from "discord.js";

import { Client } from "./types";
import { getenv, loadCommands } from "./utils";

async function main() {
    const client = new Client({
        intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
    });

    client.commands = await loadCommands();

    client.once(Events.ClientReady, (readyClient) => {
        console.log(`Logged in as ${readyClient.user.tag}`);
    });

    client.on(Events.InteractionCreate, async (interaction) => {
        // TODO Change if-else statements with switch-case
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) {
                console.error(`No command matching ${interaction.commandName}`);
            } else try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
            }
            return;
        }

        console.error(
            `Interaction type not supported: ${interaction.type.toString()}`
        );
    });

    client.login(getenv("DISCORD_TOKEN"));
}

main().catch(console.error);
