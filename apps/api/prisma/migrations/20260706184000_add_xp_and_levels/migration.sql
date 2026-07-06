-- AlterTable
ALTER TABLE `users` ADD COLUMN `total_xp` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `user_tool_usages` ADD COLUMN `daily_use_count` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `daily_use_date` DATE NULL;

-- CreateTable
CREATE TABLE `level_configs` (
    `level` INTEGER NOT NULL,
    `min_xp` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`level`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
