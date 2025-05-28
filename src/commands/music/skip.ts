import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember } from "discord.js";
import { getVoiceConnection, AudioPlayerStatus } from "@discordjs/voice";

import { Client } from "../../types";
import { getGuildData } from "../../utils";

export const data = new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Skips current song.");

export async function execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guildId) return;
    const client = interaction.client as Client;

    const connection = getVoiceConnection(interaction.guildId);
    if (!connection) {
        await interaction.reply("Can't skip a song if I'm not playing anything.");
        return;
    }

    const player = getGuildData(client, interaction.guildId).player;
    if (!player || player.state.status !== AudioPlayerStatus.Playing){
        await interaction.reply("Can't skip a song if I'm not playing anything.");
        return;
    }

    player.stop();
    await interaction.reply("Skipped current song.");
}
