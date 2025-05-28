import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";

import { Queue, Client } from "../../types";
import { getGuildData, searchYoutube } from "../../utils";

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
            .setName("remove")
            .setDescription("Removes an item from the queue.")
            .addNumberOption(numberOption => {
                return numberOption
                    .setName("index")
                    .setDescription("The position of the song you want to remove.")
                    .setRequired(true);
            });
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

    const queue = getGuildData(client, interaction.guild.id).musicQueue;

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
        queue.enqueue(result);
        interaction.reply(`Successfully added "${query}" to the queue.`);
        break;

    case "list":
        if (queue.getSize() === 0) {
            await interaction.reply("Queue is empty.");
            return;
        }
        const message = queue
            .getItems()
            .map((content, index) => `${index + 1}. ${content.title}`)
            .join("\n");
        await interaction.reply(message);
        break;
    case "remove":
        const index = interaction.options.getNumber("index");
        if (!index) return;

        const removed = queue.removeAt(index - 1);
        if (!removed) await interaction.reply("Please select a valid index.");
        else          await interaction.reply(`Removed "${removed.title}" from the queue`);
    }
}
