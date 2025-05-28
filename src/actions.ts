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

import { Client, GuildData, Queue } from "./types";
import { createAudioStreamFromYoutube, getGuildData } from "./utils";

export function joinVoiceChannel(channel: VoiceBasedChannel) {
    return discJoinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guildId,
        selfMute: false,
        selfDeaf: true,
        adapterCreator: channel.guild.voiceAdapterCreator,
    });
}

export function leaveVoiceChannel(client: Client, guildId: string) {
    
    const connection = getVoiceConnection(guildId);
    if (!connection) return;

    const current = getGuildData(client, guildId).currentSong;
    if (current) {
        current.stream.kill();
    }

    connection.destroy();
}

export async function playQueue(client: Client, guildId: string): Promise<boolean> {
    const guildData = getGuildData(client, guildId);
    if (!guildData || guildData.musicQueue.isEmpty()) return false;
    
    const queue = guildData.musicQueue;
    const connection = getVoiceConnection(guildId);
    if (!connection) return false;

    await entersState(connection, VoiceConnectionStatus.Ready, 10_000);

    const player = createAudioPlayer();
    connection.subscribe(player);
    guildData.player = player;

    async function playNext() {
        if (queue.isEmpty()) {
            guildData.currentSong = null;
            return;
        }
        const next = queue.dequeue()!;
        const stream = await createAudioStreamFromYoutube(next.url);
        if (stream) {
            player.play(stream.resource);
            guildData.currentSong = {
                ...next,
                stream,
            };
        }
    }

    player.on(AudioPlayerStatus.Idle, () => {
        if (guildData.currentSong) guildData.currentSong.stream.kill();
        playNext().catch(console.error);
    });

    await playNext();
    return true;

    //const item = queue.dequeue();
    //if (item) player.play(item.content);
    //player.on("stateChange", (oldState: AudioPlayerState, newState: AudioPlayerState) => {
    //    if (oldState.status === AudioPlayerStatus.Playing &&
    //        newState.status === AudioPlayerStatus.Idle) {
    //        const nextItem = queue.dequeue();
    //        if (nextItem) player.play(nextItem.content);
    //    }
    //});

    //return true;
}
