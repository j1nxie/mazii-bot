import { ApplyOptions } from "@sapphire/decorators";
import { Args, Command } from "@sapphire/framework";
import { EmbedBuilder, Message } from "discord.js";
import { fetchKanji, fetchWord } from "../helpers/search";

@ApplyOptions<Command.Options>({
	description: "fetch a word",
	options: ["query"]
})
export class SearchCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) => {
			builder
				.setName(this.name)
				.setDescription(this.description)
				.addStringOption((option) => option.setName("query").setDescription("the query to search for").setRequired(true));
		});
	}

	public override async messageRun(message: Message, args: Args) {
		const query = await args.rest("string");
		return this.searchQuery(message, query);
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const query = interaction.options.getString("query", true);
		return this.searchQuery(interaction, query);
	}

	private async searchQuery(interactionOrMessage: Message | Command.ChatInputCommandInteraction, query: string) {
		const embed = new EmbedBuilder().setTitle("searching...").setDescription(`searching for your query ${query}... gimme a sec...`);

		const replyMessage =
			interactionOrMessage instanceof Message
				? await interactionOrMessage.channel.send({ embeds: [embed] })
				: await interactionOrMessage.reply({ embeds: [embed], fetchReply: true });

		const wordPromise = fetchWord(query);
		const kanjiPromise = fetchKanji(query);
		const [wordResponse, kanjiResponse] = await Promise.all([wordPromise, kanjiPromise]);

		if (wordResponse.status === 200 && kanjiResponse.status === 200) {
			const word = wordResponse.data[0];
			let kanaList: string = "";
			for (const pronunciation of word.pronunciation) {
				for (const transcription of pronunciation.transcriptions) {
					kanaList += `- ${transcription.kana} (${transcription.romaji})\n`;
				}
			}
			const wordEmbed = new EmbedBuilder().setTitle(word.word).setDescription(kanaList).addFields(
				{ name: "meaning", value: word.short_mean, inline: false },
			);

			if (interactionOrMessage instanceof Message) {
				return replyMessage.edit({ embeds: [wordEmbed] });
			}

			return interactionOrMessage.editReply({
				embeds: [wordEmbed]
			});
		}
		if (interactionOrMessage instanceof Message) {
			return replyMessage.edit({ content: "oops" });
		}

		return interactionOrMessage.editReply({
			content: "oops"
		});
	}
}
