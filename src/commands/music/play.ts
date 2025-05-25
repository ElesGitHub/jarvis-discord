import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember } from "discord.js";
import { getVoiceConnection } from "@discordjs/voice";

import { joinVoiceChannel, playQueue } from "../../actions";
import { Client } from "../../types";

export const data = new SlashCommandBuilder()
    .setName("play")
    .setDescription("Starts playing queue contents in your channel.");

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

    playQueue(client, interaction.guildId);
}
