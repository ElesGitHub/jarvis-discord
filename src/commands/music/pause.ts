
import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember } from "discord.js";
import { getVoiceConnection, AudioPlayerStatus } from "@discordjs/voice";

import { Client } from "../../types";
import { getGuildData } from "../../utils";

export const data = new SlashCommandBuilder()
    .setName("pause")
    .setDescription("Pauses audio playing.");

export async function execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guildId) return;
    const client = interaction.client as Client;

    const connection = getVoiceConnection(interaction.guildId);
    if (!connection) {
        await interaction.reply("Can't pause audio if I'm not playing anything.");
        return;
    }

    const player = getGuildData(client, interaction.guildId).player;
    if (!player || player.state.status !== AudioPlayerStatus.Playing){
        await interaction.reply("Can't pause audio if I'm not playing anything.");
        return;
    }

    player.pause();
    await interaction.reply("Paused current song.");
}
