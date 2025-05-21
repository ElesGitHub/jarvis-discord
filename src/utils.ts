import { Collection } from "discord.js";
import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

import { Command } from "./types";

const COMMANDS_PATH = path.join(__dirname, "./commands");

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
