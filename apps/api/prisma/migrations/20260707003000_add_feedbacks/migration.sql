-- CreateTable
CREATE TABLE `feedbacks` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `type` ENUM('feature', 'performance', 'style', 'other') NOT NULL,
    `content` VARCHAR(200) NOT NULL,
    `contact` VARCHAR(100) NULL,
    `image_urls` JSON NOT NULL,
    `status` ENUM('pending', 'processing', 'resolved', 'closed') NOT NULL DEFAULT 'pending',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `feedbacks_user_id_created_at_idx`(`user_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `feedbacks` ADD CONSTRAINT `feedbacks_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
