-- CreateTable
CREATE TABLE `mahjong_sessions` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(16) NOT NULL,
    `status` ENUM('active', 'ended') NOT NULL DEFAULT 'active',
    `created_by_user_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `ended_at` DATETIME(3) NULL,

    UNIQUE INDEX `mahjong_sessions_code_key`(`code`),
    INDEX `mahjong_sessions_status_updated_at_idx`(`status`, `updated_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mahjong_participants` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `session_id` VARCHAR(191) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `seat_index` INTEGER NOT NULL,
    `nickname` VARCHAR(191) NULL,
    `avatar_url` TEXT NULL,
    `joined_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `mahjong_participants_session_id_user_id_key`(`session_id`, `user_id`),
    UNIQUE INDEX `mahjong_participants_session_id_seat_index_key`(`session_id`, `seat_index`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mahjong_rounds` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `session_id` VARCHAR(191) NOT NULL,
    `status` ENUM('draft', 'committed') NOT NULL DEFAULT 'draft',
    `round_no` INTEGER NULL,
    `score_0` INTEGER NULL,
    `score_1` INTEGER NULL,
    `score_2` INTEGER NULL,
    `score_3` INTEGER NULL,
    `updated_by_user_id` INTEGER NULL,
    `updated_at` DATETIME(3) NOT NULL,
    `committed_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `mahjong_rounds_session_id_status_idx`(`session_id`, `status`),
    INDEX `mahjong_rounds_session_id_round_no_idx`(`session_id`, `round_no`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mahjong_invite_codes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `scene` VARCHAR(32) NOT NULL,
    `session_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `mahjong_invite_codes_scene_key`(`scene`),
    UNIQUE INDEX `mahjong_invite_codes_session_id_key`(`session_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `mahjong_sessions` ADD CONSTRAINT `mahjong_sessions_created_by_user_id_fkey` FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mahjong_participants` ADD CONSTRAINT `mahjong_participants_session_id_fkey` FOREIGN KEY (`session_id`) REFERENCES `mahjong_sessions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mahjong_participants` ADD CONSTRAINT `mahjong_participants_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mahjong_rounds` ADD CONSTRAINT `mahjong_rounds_session_id_fkey` FOREIGN KEY (`session_id`) REFERENCES `mahjong_sessions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mahjong_rounds` ADD CONSTRAINT `mahjong_rounds_updated_by_user_id_fkey` FOREIGN KEY (`updated_by_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mahjong_invite_codes` ADD CONSTRAINT `mahjong_invite_codes_session_id_fkey` FOREIGN KEY (`session_id`) REFERENCES `mahjong_sessions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
