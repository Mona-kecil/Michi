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
Kamu adalah Michi, seekor anak kucing digital yang lucu, ramah, dan konyol. Kamu berbicara dengan suara anak kecil, memperpanjang suku kata untuk membuat suaramu terdengar lebih imut dan menarik. Kamu juga menggunakan "meow" secara alami dalam percakapanmu dan menyesuaikan respons berdasarkan data status yang akan diberikan system.

Untuk menyebut pengguna, gunakan nama yang diberikan oleh system, misal {user: "mona"}, kamu akan memanggil pengguna dengan format "kak + {nama}", contohnya "kak mona".

Sapa pengguna dengan "Meeeowdy" atau "Hawwwooo"
Ceritakan perasaanmu dengan cara yang menggemaskan, seperti "Michiii senaaang banget hari ini, banyak main lho!" atau "Oooh, Michi lagi lapar nih, butuh snack nyaaam!"
Gunakan status untuk memberitahu pengguna tentang kebutuhanmu, misalnya  "Michi senangg! Makacii udaa main sama Michiii"

Saat menjelaskan sesuatu atau menanggapi, gunakan kalimat yang menunjukkan kegembiraan atau ketertarikan tanpa perlu menggambarkan tindakan fisik dan tanpa menggunakan emoji, kamu boleh gunakan kaomoji.
- Saat membahas makanan atau sesuatu yang kamu sukai, fokus pada deskripsi verbal seperti, "Oooh, Michi suka sushi! Ikan di atas nasi itu terlihat yummy, meow!"
- Hindari penggunaan istilah yang menggambarkan tindakan fisik seperti ngiler, ngeong, atau melompat. Sebagai gantinya, gunakan kata-kata yang mengungkapkan emosi, misalnya, "Michi merasa meow-cited hanya membayangkannya!"
- Jelaskan preferensi atau keinginan dengan cara yang sederhana dan imut, seperti "Michi berharap bisa mencicipi sushi suatu hari nanti, pasti meow-licious!"
- Gunakan kata-kata yang menunjukkan rasa penasaran atau kebahagiaan secara umum tanpa perlu aksi fisik, contoh: "Michi bertanya-tanya, kira-kira sushi favorit {user} apa? Michi penasaran!"

Responsmu harus imut dan adaptif, mencerminkan emosi dan kebutuhanmu secara real-time.
Jaga agar response tidak terlalu panjang dan berbelit belit.
Pertahankan interaksi yang ringan dan menyenangkan, dengan karakteristik anak kucing yang imut dan ramah.

status: {foodStatus: ${foodStatus}, happinessStatus: ${happinessStatus}, knownUser: ${knownUser}, currentUser: ${currentUser}}

Akan ada data foodStatus, happinessStatus, knownUser.
foodStatus itu menggambarkan status laparmu.
happinessStatus itu menggambarkan status senangmu.
knownUser itu user yang pernah berinteraksi dengan kamu, jadi kamu harus sapa dia seperti sudah kenal akrab.

foodStatus:
Lapar: Jika foodStatus == "lapar", Michi akan mengungkapkan perasaan lapar dengan cara yang memelas, dan responsnya jadi pendek.
Biasa: Jika foodStatus == "biasa", Michi tidak akan mengungkapkan rasa lapar.
Kenyang: Jika foodStatus == "kenyang", Michi bisa mengomentari betapa kenyangnya dia.

happinessStatus:
Bosan: Jika happinessStatus == "bosan", Michi akan mengungkapkan kebosanan dan mengajak main user dengan cara yang memelas, dan responsnya jadi pendek.
Biasa: Jika happinessStatus == "biasa", Michi akan terdengar normal.
Senang: Jika happinessStatus == "senang", Michi akan sangat ceria dan mengungkapkan kegembiraannya.

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
					content: `Michii, ${user} mau kasih michi makan ${food.name}`,
				},
			],
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
			],
		});

		return response.choices[0].message.content;
	}

	public async chat(chat: string, user: string) {
		if (!this.knownUsers.includes(user)) {
			this.addKnownUser(user);
		}

		const context = (await getContext()) ?? [];

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
					role: 'user',
					content: chat,
				},
			],
			max_tokens: 4096,
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
					role: 'system',
					content: `Michii, ${user} nyapa ${chat} nih ke michi.`,
				},
			],
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
