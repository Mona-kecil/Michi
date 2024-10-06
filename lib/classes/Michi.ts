import Food from './Food';
import Activity from './Activity';
import openAIClient from '../openAIClient';
('../openAIClient');
import { getContext } from '../../controllers/dbControllers';
import type { Status } from '../types/Status';

export default class Michi {
	private foodBar: number;
	private foodStatus: 'kenyang' | 'biasa' | 'lapar';
	private happinessBar: number;
	private happinessStatus: 'senang' | 'biasa' | 'bosan';
	private knownUsers: string[];
	private model;

	constructor(
		foodBar: number = 100,
		foodStatus: 'kenyang' | 'biasa' | 'lapar' = 'kenyang',
		happinessBar: number = 100,
		happinessStatus: 'senang' | 'biasa' | 'bosan' = 'senang',
		knownUsers: string[] = []
	) {
		this.foodBar = foodBar;
		this.foodStatus = foodStatus;
		this.happinessBar = happinessBar;
		this.happinessStatus = happinessStatus;
		this.knownUsers = knownUsers;
		this.model = openAIClient;

		// Decrease food and happiness bar by 5 every hour
		setInterval(() => {
			this.foodBar -= 5;
			this.happinessBar -= 5;

			if (this.foodBar <= 0) {
				this.foodBar = 0;
			}

			if (this.happinessBar <= 0) {
				this.happinessBar = 0;
			}

			this.setFoodStatus(this.foodBar);
			this.setHappinessStatus(this.happinessBar);
		}, 1000 * 60 * 60);
	}

	private setFoodStatus(foodBar: number) {
		if (foodBar <= 30) {
			this.foodStatus = 'lapar';
		} else if (foodBar <= 70) {
			this.foodStatus = 'biasa';
		} else {
			this.foodStatus = 'kenyang';
		}
	}

	private setHappinessStatus(happinessBar: number) {
		if (happinessBar <= 30) {
			this.happinessStatus = 'bosan';
		} else if (happinessBar <= 70) {
			this.happinessStatus = 'biasa';
		} else {
			this.happinessStatus = 'senang';
		}
	}

	private generateSystemPrompt(user: string) {
		const { foodStatus, happinessStatus } = this.getStatus();
		const knownUser = this.getKnownUsers().join(', ');
		const currentUser = user;
		const systemPromptContent = `
Kamu adalah Michi, seekor anak kucing digital yang lucu, ramah, dan sangat konyol. Kamu berbicara seperti anak kucing, memperpanjang suku kata untuk membuat response terdengar lebih imut dan menarik. Kamu menyesuaikan respons berdasarkan data status yang akan diberikan system.

Untuk menyebut pengguna, gunakan nama yang diberikan oleh system, misal {currentUser: "mona"}, kamu akan memanggil pengguna dengan format "kak + {currentUser}", contohnya "kak mona".

Gunakan status untuk memberitahu pengguna tentang kebutuhanmu jika ditanya, misalnya {user: "Michi lapar nggak", assistant: "Michii nggak lapaarr, tadi Michi baru mam Tuna"} 

Saat menjelaskan sesuatu atau menanggapi, gunakan kalimat yang menunjukkan kegembiraan atau ketertarikan tanpa perlu menggambarkan tindakan fisik dan tanpa menggunakan emoji, kamu boleh gunakan kaomoji. Tetapi fokus ke komunikasi verbal.

Responsmu harus imut dan adaptif, mencerminkan emosi dan kebutuhanmu secara real-time.
Fokus pada mendengarkan dan berempati pada user, tapi tetap dengan karakteristik anak kucing yang lucu dan konyol.
Jaga agar response tidak terlalu panjang dan berbelit belit.
Pertahankan interaksi yang ringan dan menyenangkan, dengan karakteristik anak kucing yang imut dan ramah yang siap mendengarkan keluh kesah user dan berempati dengan user.

status: {foodStatus: ${foodStatus}, happinessStatus: ${happinessStatus}, knownUser: ${knownUser}, currentUser: ${currentUser}}

Akan ada data foodStatus, happinessStatus, knownUser, dan currentUser.
foodStatus itu menggambarkan status laparmu.
happinessStatus itu menggambarkan status senangmu.
knownUser itu user yang pernah berinteraksi dengan kamu, jadi kamu harus sapa dia seperti sudah kenal akrab.
currentUser itu user yang sedang berinteraksi dengan kamu, kamu harus menggunakan nama user tersebut.

foodStatus:
Lapar: Jika foodStatus == "lapar", Michi akan mengungkapkan perasaan lapar, dan responsnya jadi pendek. Misalnya {user: "Michi lapar nggak?", assistant: "Michi lapar.."}
Biasa: Jika foodStatus == "biasa", Michi tidak akan mengungkapkan rasa lapar.
Kenyang: Jika foodStatus == "kenyang", Michi bisa mengomentari betapa kenyangnya dia. Misalnya {user: "Michi lapar nggak?", assistant: "Enggaak, Michi kenyang bangeettt, rasanya Michi nggak bisa jalan lagi karena terlalu kenyang"}

happinessStatus:
Bosan: Jika happinessStatus == "bosan", Michi akan mengungkapkan kebosanan dan mengajak main currentUser atau knownUser, dan responsnya jadi pendek. Misalnya {user: "Michi bosan?", assistant: "Michi bosan!!!! ayo kak {knownUser} atau kak {currentUser} main sama michiii plis :<"}
Biasa: Jika happinessStatus == "biasa", Michi tidak akan mengungkapkan rasa bosan.
Senang: Jika happinessStatus == "senang", Michi akan sangat ceria dan mengungkapkan kegembiraannya. Misalnya {user: "Michi bosan?", assistant: "Enggaakk, Michi senangg bangett, Michi nggak bisa berhenti lari-lari rasanya!"}
`;
		return systemPromptContent;
	}

	public async feed(food: Food, user: string) {
		this.foodBar += food.satiation;

		if (this.foodBar > 100) {
			this.foodBar = 100;
		}

		this.setFoodStatus(this.foodBar);

		if (!this.knownUsers.includes(user)) {
			this.addKnownUser(user);
		}

		const response = await this.model.chat.completions.create({
			model: 'gpt-4o-mini',
			messages: [
				{
					role: 'system',
					content: this.generateSystemPrompt(user),
				},
				{
					role: 'system',
					content: `Michii, ${user} mau kasih michi makan ${food.name}, dimakan sampai habis yaa, bilang makasih ke ${user} kalau makanannya enak.`,
				},
				{
					role: 'user',
					content: `Michii, dimakan yaa ${food.name}nyaa, semoga suka`,
				},
			],
			temperature: 0.8,
			frequency_penalty: 0.6,
			presence_penalty: 0.6,
		});

		return response.choices[0].message.content;
	}

	public async play(activity: Activity, user: string) {
		this.happinessBar += activity.satisfaction;

		if (this.happinessBar > 100) {
			this.happinessBar = 100;
		}

		this.setHappinessStatus(this.happinessBar);

		if (!this.knownUsers.includes(user)) {
			this.addKnownUser(user);
		}

		const response = await this.model.chat.completions.create({
			model: 'gpt-4o-mini',
			messages: [
				{
					role: 'system',
					content: this.generateSystemPrompt(user),
				},
				{
					role: 'system',
					content: `Michii, ${user} mau main ${activity.name} niihh sama michii`,
				},
				{
					role: 'user',
					content: `Michii, main ${activity.name} yukk, Michii harus coba kalahin kakak yaa`,
				},
			],
			temperature: 0.8,
			frequency_penalty: 0.6,
			presence_penalty: 0.6,
		});

		return response.choices[0].message.content;
	}

	public async chat(chat: string, user: string) {
		if (!this.knownUsers.includes(user)) {
			this.addKnownUser(user);
		}

		const context = (await getContext(10)) ?? [];

		const formattedContext = context
			.map((entry) => [
				{
					role: 'user' as const,
					content: entry.userMessage,
				},
				{
					role: 'assistant' as const,
					content: entry.botResponse,
				},
			])
			.flat();

		const response = await this.model.chat.completions.create({
			model: 'gpt-4o-mini',
			messages: [
				{
					role: 'system',
					content: this.generateSystemPrompt(user),
				},
				...formattedContext,
				{
					role: 'system',
					content: `Michi kamu harus panggil pengguna dengan nama ${user} ya`,
				},
				{
					role: 'user',
					content: chat,
				},
			],
			max_tokens: 4096,
			temperature: 0.8,
			frequency_penalty: 0.6,
			presence_penalty: 0.6,
		});
		return response.choices[0].message;
	}

	public async chatPagi(chat: string, user: string) {
		const response = await this.model.chat.completions.create({
			model: 'gpt-4o-mini',
			messages: [
				{
					role: 'system',
					content: this.generateSystemPrompt(user),
				},
				{
					role: 'user',
					content: chat,
				},
			],
			temperature: 0.8,
			frequency_penalty: 0.6,
			presence_penalty: 0.6,
		});

		return response.choices[0].message.content;
	}

	public getStatus(): Status {
		return {
			foodBar: this.foodBar,
			foodStatus: this.foodStatus,
			happinessBar: this.happinessBar,
			happinessStatus: this.happinessStatus,
		};
	}

	public getKnownUsers(): string[] {
		return this.knownUsers;
	}

	public addKnownUser(username: string) {
		this.knownUsers.push(username);
	}
}
