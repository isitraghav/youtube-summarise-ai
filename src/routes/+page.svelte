<script>
	import axios from 'axios';
	import { parse } from 'marked';

	let link, link_id;
	let loading = false;
	let loadedcontent = false;
	let thumbnail,
		title,
		videoUrl = [],
		transcript;

	let followupQuestion,
		loadingAnswer = false;

	let summary;
	let conversation = [];
	async function download() {
		videoUrl = [];
		loading = true;
		if (link.includes('youtube.com/watch?v=')) {
			link_id = link.split('watch?v=')[1].split('&')[0];
		} else if (link.includes('youtu.be/')) {
			link_id = link.split('youtu.be/')[1].split('?')[0];
		} else {
			alert('not youtube url');
			loading = false;
			return;
		}
		await axios
			.get('/api?v=' + link_id)
			.then((res) => {
				let data = res.data.info;
				transcript = res.data.transcript;
				thumbnail = data.videoDetails.thumbnails[data.videoDetails.thumbnails.length - 1].url;
				title = data.videoDetails.title;
				console.log(
					data.player_response.captions.playerCaptionsTracklistRenderer.captionTracks[0].baseUrl
				);
				data.formats.forEach((vid) => {
					if (vid.hasAudio && vid.hasVideo) {
						videoUrl = [
							...videoUrl,
							{
								quality: vid.qualityLabel,
								url: vid.url
							}
						];
					}
				});
				console.log(data);
				summary = res.data.summary;
				conversation = [
					...conversation,
					{
						sender: 'AI',
						text: summary
					}
				];
			})
			.finally(() => {
				loading = false;
				loadedcontent = true;
			});
	}

	async function followup() {
		conversation = [
			...conversation,
			{
				sender: 'User',
				text: followupQuestion
			}
		];
		loadingAnswer = true;
		await axios
			.post('/followup', {
				transcript: transcript,
				followupQuestion: followupQuestion
			})
			.then((res) => {
				loadingAnswer = false;
				followupQuestion = '';
				conversation = [
					...conversation,
					{
						sender: 'AI',
						text: res.data.answer
					}
				];
			});
	}
</script>

<div class="text-center flex flex-col">
	<div class="text-xl">Youtube Summarise AI</div>
	<div class="text-xs opacity-60">get video summary and ask followup questions</div>
</div>
<div class="mt-4">
	<div class="flex gap-3 justify-center items-center">
		<input
			disabled={loading}
			bind:value={link}
			placeholder="https://youtube.com/watch?v=dQw4w9WgXcQ&ab_channel=RickAstley"
			type="text"
			class="text-sm px-2 h-8 rounded bg-[#252525] text-white border border-[#353535]"
		/>
		<button
			disabled={loading}
			on:click={download}
			class="p-2 rounded-lg border border-[#353535] bg-[#171717] flex justify-center items-center"
		>
			<i class="bx bx-search"></i>
		</button>
	</div>
</div>

<div class="mt-3">
	{#if loading}
		<div class="flex mt-5 justify-center items-center h-8 gap-3">
			<i class="bx bx-cog animate-spin"></i>
			<div class="text-sm">loading, this might take some time</div>
		</div>
	{:else if loadedcontent}
		<div class=" border rounded-lg border-[#353535] bg-[#171717]">
			<img src={thumbnail} alt={title} class="rounded-md rounded-b-sm" />
			<div class="p-2 text-center truncate">
				{title}
			</div>
		</div>
	{/if}
	{#if summary}
		<div class="">
			{#each conversation as msgs}
				<div class="mt-2">
					{msgs.sender}: <span class="opacity-60">{@html parse(msgs.text)}</span>
				</div>
			{/each}
		</div>
		{#if loadingAnswer}
			<div>
				<div class="flex mt-5 justify-center items-center h-8 gap-3">
					<i class="bx bx-cog animate-spin"></i>
					<div>AI is typing</div>
				</div>
			</div>
		{/if}
		<div class="flex p-2 gap-3 justify-center items-center">
			<input
				disabled={loadingAnswer}
				bind:value={followupQuestion}
				placeholder="Tell me more"
				type="text"
				class="text-sm px-2 h-8 rounded bg-[#252525] text-white border border-[#353535]"
			/>
			<button
				disabled={loadingAnswer}
				on:click={followup}
				class="p-2 rounded-lg border border-[#353535] bg-[#171717] flex justify-center items-center"
			>
				<i class="bx bx-send"></i>
			</button>
		</div>
	{/if}
</div>
