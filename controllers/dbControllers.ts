import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function createLog(
	userId: string,
	userMessage: string,
	botResponse: string
) {
	try {
		return await prisma.log.create({
			data: {
				userId,
				userMessage,
				botResponse,
			},
		});
	} catch (error) {
		console.error(`Error creating log: ${error}`);
		return null;
	}
}

export async function uploadState(
	foodBar: number,
	foodStatus: 'lapar' | 'biasa' | 'kenyang',
	happinessBar: number,
	happinessStatus: 'senang' | 'biasa' | 'bosan',
	knownUsers: string[]
) {
	try {
		return await prisma.michi.create({
			data: {
				foodBar,
				foodStatus,
				happinessBar,
				happinessStatus,
				knownUsers,
			},
		});
	} catch (error) {
		console.error(`Error uploading michi state: ${error}`);
		return null;
	}
}

export async function getState() {
	try {
		return await prisma.michi.findFirst({
			select: {
				foodBar: true,
				foodStatus: true,
				happinessBar: true,
				happinessStatus: true,
				knownUsers: true,
			},
			orderBy: {
				id: 'desc',
			},
			take: 1,
		});
	} catch (error) {
		console.error(`Error getting michi state: ${error}`);
		return null;
	}
}

export async function getContext(n: number = 10) {
	try {
		return await prisma.log.findMany({
			where: {
				userMessage: {
					not: {
						equals: 'utility commands',
					},
				},
			},
			take: n,
			orderBy: {
				createdAt: 'desc',
			},
			select: {
				userMessage: true,
				botResponse: true,
			},
		});
	} catch (error) {
		console.error(`Error getting context: ${error}`);
		return null;
	}
}
