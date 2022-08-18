/*
  Warnings:

  - A unique constraint covering the columns `[user_id]` on the table `settings` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `user_id` to the `settings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `age` ADD COLUMN `owner_id` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `classe` ADD COLUMN `owner_id` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `commune` ADD COLUMN `owner_id` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `comportement` ADD COLUMN `owner_id` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `departement` ADD COLUMN `owner_id` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `espece` ADD COLUMN `owner_id` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `estimation_distance` ADD COLUMN `owner_id` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `estimation_nombre` ADD COLUMN `owner_id` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `inventaire` ADD COLUMN `owner_id` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `lieudit` ADD COLUMN `owner_id` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `meteo` ADD COLUMN `owner_id` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `milieu` ADD COLUMN `owner_id` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `observateur` ADD COLUMN `owner_id` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `settings` ADD COLUMN `user_id` VARCHAR(191) NOT NULL,
    MODIFY `are_associes_displayed` BIT(1) NOT NULL DEFAULT true,
    MODIFY `is_meteo_displayed` BIT(1) NOT NULL DEFAULT true,
    MODIFY `is_distance_displayed` BIT(1) NOT NULL DEFAULT true,
    MODIFY `is_regroupement_displayed` BIT(1) NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE `sexe` ADD COLUMN `owner_id` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `unique_user_id` ON `settings`(`user_id`);

-- AddForeignKey
ALTER TABLE `age` ADD CONSTRAINT `fk_age_owner_id` FOREIGN KEY (`owner_id`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `classe` ADD CONSTRAINT `fk_classe_owner_id` FOREIGN KEY (`owner_id`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `commune` ADD CONSTRAINT `fk_commune_owner_id` FOREIGN KEY (`owner_id`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `comportement` ADD CONSTRAINT `fk_comportement_owner_id` FOREIGN KEY (`owner_id`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `departement` ADD CONSTRAINT `fk_departement_owner_id` FOREIGN KEY (`owner_id`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `espece` ADD CONSTRAINT `fk_espece_owner_id` FOREIGN KEY (`owner_id`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `estimation_distance` ADD CONSTRAINT `fk_estimation_distance_owner_id` FOREIGN KEY (`owner_id`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `estimation_nombre` ADD CONSTRAINT `fk_estimation_nombre_owner_id` FOREIGN KEY (`owner_id`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `inventaire` ADD CONSTRAINT `fk_inventaire_owner_id` FOREIGN KEY (`owner_id`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `lieudit` ADD CONSTRAINT `fk_lieudit_owner_id` FOREIGN KEY (`owner_id`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `meteo` ADD CONSTRAINT `fk_meteo_owner_id` FOREIGN KEY (`owner_id`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `milieu` ADD CONSTRAINT `fk_milieu_owner_id` FOREIGN KEY (`owner_id`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `observateur` ADD CONSTRAINT `fk_observateur_owner_id` FOREIGN KEY (`owner_id`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `settings` ADD CONSTRAINT `fk_settings_user_id` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `sexe` ADD CONSTRAINT `fk_sexe_owner_id` FOREIGN KEY (`owner_id`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;
