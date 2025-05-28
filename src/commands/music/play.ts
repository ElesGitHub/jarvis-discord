import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember } from "discord.js";
import { getVoiceConnection } from "@discordjs/voice";

import { joinVoiceChannel, playQueue } from "../../actions";
import { getGuildData, searchYoutube } from "../../utils";
import { Client } from "../../types";

export const data = new SlashCommandBuilder()
    .setName("play")
    .setDescription("Starts playing queue contents in your channel.")
    .addStringOption(stringOption => {
        return stringOption
            .setName("query")
            .setDescription("What you want to search for.")
            .setRequired(false);
    });

export async function execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guildId) return;
    const channel = (interaction.member as GuildMember)?.voice.channel;

    const client = interaction.client as Client;

    if (!channel) {
        await interaction.reply("You must be connected to a voice channel to use this command.");
        return;
    }

    const connection = getVoiceConnection(interaction.guildId);
    if (connection) connection.destroy();

    joinVoiceChannel(channel);
    await interaction.reply(`Joined ${channel.name}.`);

    const query = interaction.options.getString("query");
    if (query) {
        const result = (await searchYoutube(query))[0];
        getGuildData(client, interaction.guildId).musicQueue.enqueue(result);
    }

    playQueue(client, interaction.guildId);
}
