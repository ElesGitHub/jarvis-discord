import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";

import { Queue, Client } from "../../types";
import { getQueue } from "../../actions";
import { searchYoutube, createAudioResourceFromYoutube } from "../../utils";

export const data = new SlashCommandBuilder()
    .setName("queue")
    .setDescription("Manages music queue")
    .addSubcommand((subcommand) => {
        return subcommand
            .setName("list")
            .setDescription("Lists all songs in the queue.");
    })
    .addSubcommand((subcommand) => {
        return subcommand
            .setName("add")
            .setDescription("Adds a song into the queue.")
            .addStringOption(stringOption => {
                return stringOption
                    .setName("query")
                    .setDescription("What you want to search for.")
                    .setRequired(true);
            });
    })
    .addSubcommand((subcommand) => {
        return subcommand
            .setName("clear")
            .setDescription("Removes all items from the queue.");
    });

export async function execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) return;

    const client = interaction.client as Client;
    const queue = getQueue(client, interaction.guild.id);

    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
    case "clear":
        queue.clear();
        interaction.reply("Queue cleared.");
        break;

    case "add":
        const query = interaction.options.getString("query");
        if (!query) return;

        const result = (await searchYoutube(query))[0];
        const resource = await createAudioResourceFromYoutube(result.url);
        if (!resource) return;

        const audioContent = {
            name: result.title,
            content: resource,
        };

        queue.enqueue(audioContent);
        interaction.reply(`Successfully added "${query}" to the queue.`);
        break;

    case "list":
        const contents = queue.getItems();
        if (contents.length === 0) {
            await interaction.reply("Queue is empty.");
            return;
        }
        const message = contents
            .map((content, index) => `${index + 1}. ${content.name}`)
            .join("\n");
        await interaction.reply(message);
        break;
    }
}
