import {
    Client,
    REST,
    Routes,
    RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "discord.js"

import { loadCommands, getenv } from "../utils";

const TOKEN     = getenv("DISCORD_TOKEN");
const CLIENT_ID = getenv("DISCORD_CLIENT_ID");

async function deployCommands(
    client: Client,
    rest: REST,
    commands: RESTPostAPIChatInputApplicationCommandsJSONBody[]
) {
    const guilds = client.guilds.cache.map(guild => guild.id);
    console.log(`[INFO] Updating ${commands.length} commands for ${guilds.length} guilds.`);

    const promises = guilds.map(guild => {
        rest.put(Routes.applicationGuildCommands(CLIENT_ID, guild), {
            body: commands,
        });
    });

    await Promise.all(promises);
    console.log("[INFO] Successfully updated commands.");
}

async function update() {
    const commandCollection = await loadCommands();
    const commands = commandCollection.map(command => command.data.toJSON());

    const rest = new REST().setToken(TOKEN);
    const client = new Client({
        intents: [],
    });

    client.on("ready", async () => {
        // Abstracted to separate function in case updating consists of more steps
        await deployCommands(client, rest, commands);
        client.destroy();
    });
    client.login(TOKEN);
}

update();
