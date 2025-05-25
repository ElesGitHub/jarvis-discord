
import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember } from "discord.js";
import { getVoiceConnection } from "@discordjs/voice";

import { getCurrentVoiceChannel } from "../../actions";

export const data = new SlashCommandBuilder()
    .setName("leave")
    .setDescription("Leaves your voice channel.");

export async function execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) return;

    const userChannel = (interaction.member as GuildMember)?.voice.channel;
    const botChannel = getCurrentVoiceChannel(interaction.guild);

    if (!botChannel) {
        await interaction.reply("I am not in any voice channel.");
        return;
    }

    if (!userChannel || userChannel.id !== botChannel.id) {
        await interaction.reply("You must be in the same channel as me to kick me.");
    }

    const connection = getVoiceConnection(interaction.guild.id);
    if (connection) connection.destroy();
    interaction.reply("Succesfully left the voice channel.");
}
