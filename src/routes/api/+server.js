import ytdl from '@distube/ytdl-core';
import { Client } from '@gradio/client';
import { json } from '@sveltejs/kit';
import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';

export async function GET(params) {
	let summary, transcript;
	let vid = params.url.searchParams.get('v');
	const info = await ytdl.getInfo(`http://www.youtube.com/watch?v=${vid}`);
	const client = await Client.connect('HusseinEid/zephyr-7b-beta-chatbot');

	await axios
		.get(info.player_response.captions.playerCaptionsTracklistRenderer.captionTracks[0].baseUrl)
		.then(async (res) => {
			transcript = res.data;
			const parser = new XMLParser();
			let jObj = parser.parse(transcript);
			transcript = jObj.transcript.text.join(" ")
            // console.log(transcript);
			const result = await client.predict('/chat', {
                request: "you summarise every text given.",
				message: `${res.data}`
			});
			summary = result.data.join('').replace('\n', '<br />').replace('* ', '- ');
		});

	return json({ info: info, summary: summary, transcript: transcript });
}