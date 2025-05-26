import { Collection } from "discord.js";
import { createAudioResource, StreamType } from "@discordjs/voice";
import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import { spawn } from "node:child_process";

import { Command, SearchResult } from "./types";

const COMMANDS_PATH = path.join(__dirname, "./commands");
const CACHE_DIR     = path.join(__dirname, "../resources/cache");

if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
}

dotenv.config();

export function getenv(key: string) {
    const value = process.env[key];
    
    if (!value) throw new Error(`Missing enviroment variable "${key}"`);

    return value;
}

export async function loadCommands() {
    const commands = new Collection<string, Command>()
    
    for (const folder of fs.readdirSync(COMMANDS_PATH)) {
        const folderPath = path.join(COMMANDS_PATH, folder);

        const commandLoadPromises = fs
            .readdirSync(folderPath)
            .filter(filename => filename.endsWith(".ts"))
            .map(async filename => {
                const filePath = path.join(folderPath, filename);
                const command = await import(filePath);
                
                if (!command.data || !command.execute)
                    console.error(`[ERROR] Command located at ${filePath} is missing required properties`);
                else commands.set(command.data.name, command);
            });
        
        await Promise.all(commandLoadPromises);
    }

    return commands;
}

export async function searchYoutube(query: string): Promise<SearchResult[]> {
    const url =
        "https://www.googleapis.com/youtube/v3/search?" +
        "part=snippet&" +
        "type=video&" +
        `q=${encodeURIComponent(query)}&` +
        `key=${getenv("GOOGLE_CLOUD_API_KEY")}`;

    const response = await fetch(url);
    const data = await response.json();

    const RESULT_SIZE = 8;
    return data.items
               .filter((item: any) => item.id.kind === "youtube#video")
               .map((item: any) => {
                   return {
                       title: item.snippet.title,
                       url: `https://youtube.com/watch?v=${item.id.videoId}`,
                   } as SearchResult;
               });
}

export async function isValidYoutubeURL(url: string): Promise<boolean> {
    // if valid yt url, first group is video id
    const regex = /(?:https?:\/\/(?:www\.)?youtube\.com\/(?:[^\/]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=))([^"&?\/\s]{11})/;
    const match = url.match(regex);

    if (!match) return false;

    const videoId = match[1];
    const apiURL =
        "https://www.googleapis.com/youtube/v3/videos?" +
        "part=snippet&" +
        `id=${videoId}&` +
        `key=${getenv("GOOGLE_CLOUD_API_KEY")}`;

    const response = await fetch(apiURL);
    const data = await response.json();

    if (!data || !data.items || data.items.length == 0) return false;
    return true;
}

export async function createAudioResourceFromYoutube(url: string) {
    if (!await isValidYoutubeURL(url)) return null;

    const ytdlp = spawn(
        "yt-dlp",
        ["--cache-dir", CACHE_DIR, "-f", "bestaudio", "-o", "-", url],
        { stdio: ["ignore", "pipe", "ignore"] }
    );

    const ffmpeg = spawn(
        "ffmpeg",
        ["-i", "pipe:0", "-f", "s16le", "-ar", "48000", "-ac", "2", "pipe:1"],
        { stdio: ["pipe", "pipe", "ignore"] }
    );

    ytdlp.stdout.pipe(ffmpeg.stdin);
    return createAudioResource(ffmpeg.stdout, {
        inputType: StreamType.Raw,
    });
}
