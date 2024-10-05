-- CreateTable
CREATE TABLE "Log" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "userMessage" TEXT NOT NULL,
    "botResponse" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Michi" (
    "id" SERIAL NOT NULL,
    "foodBar" INTEGER NOT NULL,
    "foodStatus" TEXT NOT NULL,
    "happinessBar" INTEGER NOT NULL,
    "happinessStatus" TEXT NOT NULL,
    "knownUsers" TEXT[],

    CONSTRAINT "Michi_pkey" PRIMARY KEY ("id")
);
