import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember } from "discord.js";
import { getVoiceConnection, AudioPlayerStatus } from "@discordjs/voice";

import { Client } from "../../types";
import { getGuildData } from "../../utils";

export const data = new SlashCommandBuilder()
    .setName("current")
    .setDescription("Shows current song.");

export async function execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guildId) return;
    const client = interaction.client as Client;

    const current = getGuildData(client, interaction.guildId).currentSong;
    if (!current) await interaction.reply("Nothing playing right now.");
    else await interaction.reply(`Now playing:\n${current.url}`);
}
