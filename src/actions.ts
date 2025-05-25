import { VoiceBasedChannel, Guild } from "discord.js";
import {
    joinVoiceChannel as discJoinVoiceChannel,
    getVoiceConnection,
    entersState,
    AudioPlayerStatus,
    AudioPlayerState,
    createAudioPlayer,
    VoiceConnectionStatus,
} from "@discordjs/voice";

import { Client, GuildData, Queue, AudioContent } from "./types";

export function joinVoiceChannel(channel: VoiceBasedChannel) {
    return discJoinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guildId,
        selfMute: false,
        selfDeaf: true,
        adapterCreator: channel.guild.voiceAdapterCreator,
    });
}

export function getCurrentVoiceChannel(guild: Guild) {
    return guild.members.me?.voice.channel;
}

export function getQueue(client: Client, guildId: string): Queue<AudioContent> {
    let guildData = client.guildData.get(guildId);
    if (!guildData) {
        guildData = new GuildData();
        client.guildData.set(guildId, guildData);
    }

    return guildData.musicQueue;
}
 export async function playQueue(client: Client, guildId: string): Promise<boolean> {
    let guildData = client.guildData.get(guildId);

    if (!guildData || guildData.musicQueue.isEmpty()) return false;
    
    const queue = guildData.musicQueue;
    const connection = getVoiceConnection(guildId);
    if (!connection) return false;

    await entersState(connection, VoiceConnectionStatus.Ready, 10_000);

    const player = createAudioPlayer();
    const subscription = connection.subscribe(player);

    const item = queue.dequeue();
    if (item) player.play(item.content);
    player.on("stateChange", (oldState: AudioPlayerState, newState: AudioPlayerState) => {
        if (oldState.status === AudioPlayerStatus.Playing &&
            newState.status === AudioPlayerStatus.Idle) {
            const nextItem = queue.dequeue();
            if (nextItem) player.play(nextItem.content);
        }
    });

    return true;
 }
