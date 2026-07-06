-- CreateTable
CREATE TABLE `user_decisions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `options` JSON NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT false,
    `last_used_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `user_decisions_user_id_is_active_idx`(`user_id`, `is_active`),
    INDEX `user_decisions_user_id_last_used_at_idx`(`user_id`, `last_used_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user_decisions` ADD CONSTRAINT `user_decisions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
