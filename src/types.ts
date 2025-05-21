import { Client as DiscordClient, Collection, SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { AudioResource } from "@discordjs/voice";

class Queue<T> {
    private items: T[] = [];

    constructor(capacity: number = Infinity) {}

    enqueue(item: T) {
        this.items.push(item);
    }

    dequeue(): T | undefined {
        return this.items.shift();
    }
}

export interface Command {
    data: SlashCommandBuilder;
    execute: (interaction: ChatInputCommandInteraction) => void;
}

export class Client extends DiscordClient {
    commands = new Collection<string, Command>();

    music = {
        queue: new Queue<AudioResource>(),
    }
}
