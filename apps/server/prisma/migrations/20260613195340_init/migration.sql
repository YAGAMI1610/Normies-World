-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "primaryWallet" TEXT,
    "email" TEXT,
    "telegramChatId" TEXT,
    "discordWebhook" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wallet" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "userId" TEXT,
    "isWhale" BOOLEAN NOT NULL DEFAULT false,
    "whaleScore" DOUBLE PRECISION,
    "firstSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActive" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Normie" (
    "tokenId" INTEGER NOT NULL,
    "ownerAddress" TEXT,
    "level" INTEGER NOT NULL DEFAULT 1,
    "actionPoints" INTEGER NOT NULL DEFAULT 0,
    "customized" BOOLEAN NOT NULL DEFAULT false,
    "pixelCount" INTEGER,
    "rarityScore" DOUBLE PRECISION,
    "rarityRank" INTEGER,
    "agentBound" BOOLEAN NOT NULL DEFAULT false,
    "agentId" TEXT,
    "lastSyncedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Normie_pkey" PRIMARY KEY ("tokenId")
);

-- CreateTable
CREATE TABLE "Trait" (
    "id" TEXT NOT NULL,
    "tokenId" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "Trait_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NormieOwnership" (
    "id" TEXT NOT NULL,
    "tokenId" INTEGER NOT NULL,
    "walletId" TEXT NOT NULL,
    "acquiredAt" TIMESTAMP(3) NOT NULL,
    "acquiredTx" TEXT NOT NULL,
    "current" BOOLEAN NOT NULL DEFAULT true,
    "releasedAt" TIMESTAMP(3),

    CONSTRAINT "NormieOwnership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transfer" (
    "id" TEXT NOT NULL,
    "tokenId" INTEGER NOT NULL,
    "fromAddress" TEXT NOT NULL,
    "toAddress" TEXT NOT NULL,
    "fromWalletId" TEXT,
    "toWalletId" TEXT,
    "blockNumber" BIGINT NOT NULL,
    "txHash" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transfer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sale" (
    "id" TEXT NOT NULL,
    "tokenId" INTEGER NOT NULL,
    "marketplace" TEXT NOT NULL,
    "priceEth" DOUBLE PRECISION NOT NULL,
    "buyer" TEXT NOT NULL,
    "seller" TEXT NOT NULL,
    "txHash" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Whale" (
    "walletAddress" TEXT NOT NULL,
    "holdingsCount" INTEGER NOT NULL,
    "avgHoldDurationDays" DOUBLE PRECISION NOT NULL,
    "realizedGainsEth" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unrealizedGainsEth" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rarityPreference" JSONB NOT NULL,
    "whaleScore" DOUBLE PRECISION NOT NULL,
    "lastCalculated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Whale_pkey" PRIMARY KEY ("walletAddress")
);

-- CreateTable
CREATE TABLE "WhaleFollow" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "whaleAddress" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WhaleFollow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reputation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reputation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Badge" (
    "id" TEXT NOT NULL,
    "reputationId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "awardedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Badge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlertPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "threshold" JSONB,
    "channels" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AlertPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "alertId" TEXT,
    "channel" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistoricalSnapshot" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "holderCount" INTEGER NOT NULL,
    "floorPriceEth" DOUBLE PRECISION,
    "volumeEth" DOUBLE PRECISION,
    "topTraits" JSONB NOT NULL,
    "whaleLeaderboard" JSONB NOT NULL,
    "ownershipDistribution" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HistoricalSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIInsight" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "dataSnapshot" JSONB NOT NULL,
    "citedMetrics" JSONB,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIInsight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BattleCard" (
    "id" TEXT NOT NULL,
    "tokenId" INTEGER NOT NULL,
    "attack" INTEGER NOT NULL,
    "defense" INTEGER NOT NULL,
    "speed" INTEGER NOT NULL,
    "specialAbility" TEXT NOT NULL,
    "abilityDescription" TEXT NOT NULL,
    "abilityTraitSource" TEXT NOT NULL,
    "rarityTier" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BattleCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BattleStats" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "draws" INTEGER NOT NULL DEFAULT 0,
    "winStreak" INTEGER NOT NULL DEFAULT 0,
    "elo" INTEGER NOT NULL DEFAULT 1000,
    "rank" TEXT NOT NULL DEFAULT 'Unranked',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BattleStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "player1Id" TEXT NOT NULL,
    "player2Id" TEXT NOT NULL,
    "winnerId" TEXT,
    "state" JSONB NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaderboardEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeaderboardEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_primaryWallet_key" ON "User"("primaryWallet");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_address_key" ON "Wallet"("address");

-- CreateIndex
CREATE INDEX "Wallet_userId_idx" ON "Wallet"("userId");

-- CreateIndex
CREATE INDEX "Normie_rarityRank_idx" ON "Normie"("rarityRank");

-- CreateIndex
CREATE INDEX "Trait_category_value_idx" ON "Trait"("category", "value");

-- CreateIndex
CREATE UNIQUE INDEX "Trait_tokenId_category_key" ON "Trait"("tokenId", "category");

-- CreateIndex
CREATE INDEX "NormieOwnership_walletId_current_idx" ON "NormieOwnership"("walletId", "current");

-- CreateIndex
CREATE INDEX "NormieOwnership_tokenId_current_idx" ON "NormieOwnership"("tokenId", "current");

-- CreateIndex
CREATE UNIQUE INDEX "Transfer_txHash_key" ON "Transfer"("txHash");

-- CreateIndex
CREATE INDEX "Transfer_timestamp_idx" ON "Transfer"("timestamp");

-- CreateIndex
CREATE INDEX "Transfer_tokenId_idx" ON "Transfer"("tokenId");

-- CreateIndex
CREATE INDEX "Transfer_toAddress_idx" ON "Transfer"("toAddress");

-- CreateIndex
CREATE INDEX "Transfer_fromAddress_idx" ON "Transfer"("fromAddress");

-- CreateIndex
CREATE UNIQUE INDEX "Sale_txHash_key" ON "Sale"("txHash");

-- CreateIndex
CREATE INDEX "Sale_timestamp_idx" ON "Sale"("timestamp");

-- CreateIndex
CREATE INDEX "Sale_tokenId_idx" ON "Sale"("tokenId");

-- CreateIndex
CREATE UNIQUE INDEX "WhaleFollow_userId_whaleAddress_key" ON "WhaleFollow"("userId", "whaleAddress");

-- CreateIndex
CREATE UNIQUE INDEX "Reputation_userId_key" ON "Reputation"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Badge_reputationId_type_key" ON "Badge"("reputationId", "type");

-- CreateIndex
CREATE INDEX "AlertPreference_userId_idx" ON "AlertPreference"("userId");

-- CreateIndex
CREATE INDEX "Alert_createdAt_idx" ON "Alert"("createdAt");

-- CreateIndex
CREATE INDEX "Alert_type_idx" ON "Alert"("type");

-- CreateIndex
CREATE INDEX "Notification_userId_status_idx" ON "Notification"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "HistoricalSnapshot_date_key" ON "HistoricalSnapshot"("date");

-- CreateIndex
CREATE INDEX "AIInsight_type_generatedAt_idx" ON "AIInsight"("type", "generatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "BattleCard_tokenId_key" ON "BattleCard"("tokenId");

-- CreateIndex
CREATE UNIQUE INDEX "BattleStats_userId_key" ON "BattleStats"("userId");

-- CreateIndex
CREATE INDEX "Match_player1Id_idx" ON "Match"("player1Id");

-- CreateIndex
CREATE INDEX "Match_player2Id_idx" ON "Match"("player2Id");

-- CreateIndex
CREATE INDEX "Match_mode_startedAt_idx" ON "Match"("mode", "startedAt");

-- CreateIndex
CREATE INDEX "LeaderboardEntry_category_rank_idx" ON "LeaderboardEntry"("category", "rank");

-- CreateIndex
CREATE UNIQUE INDEX "LeaderboardEntry_userId_category_key" ON "LeaderboardEntry"("userId", "category");

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trait" ADD CONSTRAINT "Trait_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES "Normie"("tokenId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NormieOwnership" ADD CONSTRAINT "NormieOwnership_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES "Normie"("tokenId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NormieOwnership" ADD CONSTRAINT "NormieOwnership_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transfer" ADD CONSTRAINT "Transfer_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES "Normie"("tokenId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transfer" ADD CONSTRAINT "Transfer_fromWalletId_fkey" FOREIGN KEY ("fromWalletId") REFERENCES "Wallet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transfer" ADD CONSTRAINT "Transfer_toWalletId_fkey" FOREIGN KEY ("toWalletId") REFERENCES "Wallet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES "Normie"("tokenId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhaleFollow" ADD CONSTRAINT "WhaleFollow_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhaleFollow" ADD CONSTRAINT "WhaleFollow_whaleAddress_fkey" FOREIGN KEY ("whaleAddress") REFERENCES "Whale"("walletAddress") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reputation" ADD CONSTRAINT "Reputation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Badge" ADD CONSTRAINT "Badge_reputationId_fkey" FOREIGN KEY ("reputationId") REFERENCES "Reputation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertPreference" ADD CONSTRAINT "AlertPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "Alert"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BattleCard" ADD CONSTRAINT "BattleCard_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES "Normie"("tokenId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BattleStats" ADD CONSTRAINT "BattleStats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_player1Id_fkey" FOREIGN KEY ("player1Id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_player2Id_fkey" FOREIGN KEY ("player2Id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaderboardEntry" ADD CONSTRAINT "LeaderboardEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
