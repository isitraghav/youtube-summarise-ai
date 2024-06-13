import ytdl from '@distube/ytdl-core';
import { Client } from "@gradio/client";
import { json } from '@sveltejs/kit';
import axios from 'axios';

export async function GET(params) {
    let summary, transcript;
    let vid = params.url.searchParams.get('v')
    const info = await ytdl.getInfo(`http://www.youtube.com/watch?v=${vid}`)
    const client = await Client.connect("HusseinEid/llama-3-chatbot");
    await axios.get(info.player_response.captions.playerCaptionsTracklistRenderer.captionTracks[0].baseUrl).then(async (res) => {
        transcript = res.data
        const result = await client.predict("/chat", {
            message: `give a summary from a youtube video. provide points is possible. \n ${res.data}`,
        });
        summary = result.data.join("").replace('\n', '<br />').replace("* ", '- ')
    })


    return json({ info: info, summary: summary, transcript: transcript });
}


// const result2 = await client.predict("/chat", {
//     message: `elaborate more`,
// });
// console.log(result2.data);