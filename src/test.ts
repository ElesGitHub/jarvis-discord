import { spawn } from "node:child_process";
import { searchYoutube, isValidYoutubeURL } from "./utils";

async function main() {
    const urls = await searchYoutube("I'm glad you came");
    const url = urls ? urls[0] : null;

    if (!url) return;
    const ytdlp = spawn(
        "yt-dlp",
        ["-f", "bestaudio", "-o", "-", url],
        { stdio: ["ignore", "pipe", "ignore"] }
    );

    //const ffmpeg = spawn(
    //    "ffmpeg",
    //    ["-i", "pipe:0", "-f", "s16le", "-ar", "48000", "-ac", "2", "pipe:1"],
    //    { stdio: ["pipe", "pipe", "ignore"] }
    //);

    const ffplay = spawn(
        "ffplay",
        ["-i", "pipe:0", "-autoexit", "-nodisp"],
        { stdio: ["pipe", "ignore", "ignore"] }
    );

    ytdlp.stdout.pipe(ffplay.stdin);
}

main();
