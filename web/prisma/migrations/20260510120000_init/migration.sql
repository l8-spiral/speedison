-- CreateTable
CREATE TABLE `leads` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ref` VARCHAR(20) NOT NULL,
    `reg_number` VARCHAR(20) NOT NULL,
    `services` JSON NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `phone` VARCHAR(40) NOT NULL,
    `email` VARCHAR(120) NOT NULL,
    `description` TEXT NULL,
    `ip_hash` VARCHAR(64) NOT NULL,
    `status` ENUM('NEW', 'CONTACTED', 'QUOTED', 'DONE', 'LOST') NOT NULL DEFAULT 'NEW',

    UNIQUE INDEX `leads_ref_key`(`ref`),
    INDEX `leads_ip_hash_created_at_idx`(`ip_hash`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contacts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `name` VARCHAR(120) NOT NULL,
    `email` VARCHAR(120) NOT NULL,
    `phone` VARCHAR(40) NULL,
    `message` TEXT NOT NULL,
    `ip_hash` VARCHAR(64) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `events` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `name` VARCHAR(60) NOT NULL,
    `props` JSON NULL,
    `ip_hash` VARCHAR(64) NOT NULL,

    INDEX `events_name_created_at_idx`(`name`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

