import { Client as DiscordClient, Collection, SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { AudioResource, AudioPlayer } from "@discordjs/voice";
import { ChildProcessByStdio } from "node:child_process";

export class Queue<T> {
    private items: T[] = [];

    getItems(): T[] {
        return this.items;
    }

    getSize(): number {
        return this.items.length;
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

    removeAt(index: number): T | null {
        if (index >= 0 && index < this.items.length)
            return this.items.splice(index, 1)[0]!;
        return null;
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
    musicQueue = new Queue<SearchResult>();
    player: AudioPlayer | null = null;
    currentSong: SearchResult & { stream: AudioStream } | null = null;
}

export class Client extends DiscordClient {
    commands = new Collection<string, Command>();

    guildData = new Collection<string, GuildData>();
}

export interface SearchResult {
    title: string;
    url:   string;
}

export class AudioStream {
    pipes: ChildProcessByStdio<any, any, any>[];
    resource: AudioResource;

    constructor(pipes: ChildProcessByStdio<any, any, any>[], resource: AudioResource) {
        this.pipes = pipes;
        this.resource = resource;
    }

    kill() {
        this.pipes.forEach(pipe => pipe.kill());
    }
}
