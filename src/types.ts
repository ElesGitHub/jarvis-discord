import { Client as DiscordClient, Collection, SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { AudioResource } from "@discordjs/voice";

export class Queue<T> {
    private items: T[] = [];

    getItems(): T[] {
        return this.items;
    }

    isEmpty(): boolean {
        return this.items.length === 0;
    }

    enqueue(item: T) {
        this.items.push(item);
    }

    dequeue(): T | undefined {
        return this.items.shift();
    }

    clear(): void {
        this.items = [];
    }
}

export interface Command {
    data: SlashCommandBuilder;
    execute: (interaction: ChatInputCommandInteraction) => void;
}

export class GuildData {
    musicQueue = new Queue<AudioContent>();
}

export interface AudioContent {
    name: string;
    content: AudioResource<any>;
}

export class Client extends DiscordClient {
    commands = new Collection<string, Command>();

    guildData = new Collection<string, GuildData>();
}

export interface SearchResult {
    title: string;
    url:   string;
}
