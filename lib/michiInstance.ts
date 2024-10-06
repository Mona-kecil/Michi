import Michi from './classes/Michi';
import { getState, uploadState } from '../controllers/dbControllers';

type FoodStatus = 'lapar' | 'biasa' | 'kenyang';
type HappinessStatus = 'senang' | 'biasa' | 'bosan';

const state = await getState();

const foodBar = state?.foodBar ?? 100;
const foodStatus = state?.foodStatus ?? 'kenyang';
const happinessBar = state?.happinessBar ?? 100;
const happinessStatus = state?.happinessStatus ?? 'senang';
const knownUsers = state?.knownUsers ?? [];

if (!state) {
	console.log('Michi state not found, creating new state');
}

const michi = new Michi(
	foodBar,
	foodStatus as FoodStatus,
	happinessBar,
	happinessStatus as HappinessStatus,
	knownUsers
);

export default michi;

// Backup state every 2 hours
setInterval(() => {
	const status = michi.getStatus();
	const knownUsers = michi.getKnownUsers();
	uploadState(
		status.foodBar,
		status.foodStatus,
		status.happinessBar,
		status.happinessStatus,
		knownUsers
	);
}, 1000 * 60 * 60 * 2);
