import { Client } from "@gradio/client";
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
    let answer;
    let vid = await request.json()
    console.log(vid);
    const client = await Client.connect("HusseinEid/llama-3-chatbot");
    const result = await client.predict("/chat", {
        message: `${vid.transcript} \n based on this transcript, answer this following question \n Q:${vid.followupQuestion}`,
    });
    answer = result.data.join("").replace('\n', '<br />').replace("* ", '- ').replace(/transcript/g, 'video')


    return json({ answer: answer });
}