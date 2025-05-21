import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";

export const data = new SlashCommandBuilder()
    .setName("test")
    .setDescription("No nonononono tocar porfas");

export async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.reply("Testing testin 1 2");
}
