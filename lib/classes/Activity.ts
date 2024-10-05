export default class Activity {
	name: string;
	satisfaction: number;

	constructor(name: string, satisfaction: number = 30) {
		this.name = name;
		if (satisfaction < 0 || satisfaction > 100) {
			this.satisfaction = 30;
		} else {
			this.satisfaction = satisfaction;
		}
	}
}
