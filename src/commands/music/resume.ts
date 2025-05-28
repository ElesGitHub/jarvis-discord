
import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember } from "discord.js";
import { getVoiceConnection, AudioPlayerStatus } from "@discordjs/voice";

import { Client } from "../../types";
import { getGuildData } from "../../utils";

export const data = new SlashCommandBuilder()
    .setName("resume")
    .setDescription("Resumes audio playing.");

export async function execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guildId) return;
    const client = interaction.client as Client;

    const connection = getVoiceConnection(interaction.guildId);
    if (!connection) {
        await interaction.reply("Can't resume song if no song was paused.");
        return;
    }

    const player = getGuildData(client, interaction.guildId).player;
    if (!player || player.state.status !== AudioPlayerStatus.Paused) {
        await interaction.reply("Can't resume song if no song was paused.");
        return;
    }

    player.unpause();
    await interaction.reply("Resumed current song.");
}
