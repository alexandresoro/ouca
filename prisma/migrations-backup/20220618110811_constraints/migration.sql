-- DropForeignKey
ALTER TABLE `age` DROP FOREIGN KEY `fk_age_owner_id`;

-- DropForeignKey
ALTER TABLE `classe` DROP FOREIGN KEY `fk_classe_owner_id`;

-- DropForeignKey
ALTER TABLE `commune` DROP FOREIGN KEY `fk_commune_departement_id`;

-- DropForeignKey
ALTER TABLE `commune` DROP FOREIGN KEY `fk_commune_owner_id`;

-- DropForeignKey
ALTER TABLE `comportement` DROP FOREIGN KEY `fk_comportement_owner_id`;

-- DropForeignKey
ALTER TABLE `departement` DROP FOREIGN KEY `fk_departement_owner_id`;

-- DropForeignKey
ALTER TABLE `donnee` DROP FOREIGN KEY `fk_donnee_age_id`;

-- DropForeignKey
ALTER TABLE `donnee` DROP FOREIGN KEY `fk_donnee_espece_id`;

-- DropForeignKey
ALTER TABLE `donnee` DROP FOREIGN KEY `fk_donnee_estimation_distance_id`;

-- DropForeignKey
ALTER TABLE `donnee` DROP FOREIGN KEY `fk_donnee_estimation_nombre_id`;

-- DropForeignKey
ALTER TABLE `donnee` DROP FOREIGN KEY `fk_donnee_inventaire_id`;

-- DropForeignKey
ALTER TABLE `donnee` DROP FOREIGN KEY `fk_donnee_sexe_id`;

-- DropForeignKey
ALTER TABLE `donnee_comportement` DROP FOREIGN KEY `fk_donnee_comportement_comportement_id`;

-- DropForeignKey
ALTER TABLE `donnee_comportement` DROP FOREIGN KEY `fk_donnee_comportement_donnee_id`;

-- DropForeignKey
ALTER TABLE `donnee_milieu` DROP FOREIGN KEY `fk_donnee_milieu_donnee_id`;

-- DropForeignKey
ALTER TABLE `donnee_milieu` DROP FOREIGN KEY `fk_donnee_milieu_milieu_id`;

-- DropForeignKey
ALTER TABLE `espece` DROP FOREIGN KEY `fk_espece_classe_id`;

-- DropForeignKey
ALTER TABLE `espece` DROP FOREIGN KEY `fk_espece_owner_id`;

-- DropForeignKey
ALTER TABLE `estimation_distance` DROP FOREIGN KEY `fk_estimation_distance_owner_id`;

-- DropForeignKey
ALTER TABLE `estimation_nombre` DROP FOREIGN KEY `fk_estimation_nombre_owner_id`;

-- DropForeignKey
ALTER TABLE `inventaire` DROP FOREIGN KEY `fk_inventaire_lieudit_id`;

-- DropForeignKey
ALTER TABLE `inventaire` DROP FOREIGN KEY `fk_inventaire_observateur_id`;

-- DropForeignKey
ALTER TABLE `inventaire` DROP FOREIGN KEY `fk_inventaire_owner_id`;

-- DropForeignKey
ALTER TABLE `inventaire_associe` DROP FOREIGN KEY `fk_inventaire_associe_inventaire_id`;

-- DropForeignKey
ALTER TABLE `inventaire_associe` DROP FOREIGN KEY `fk_inventaire_associe_observateur_id`;

-- DropForeignKey
ALTER TABLE `inventaire_meteo` DROP FOREIGN KEY `fk_inventaire_meteo_inventaire_id`;

-- DropForeignKey
ALTER TABLE `inventaire_meteo` DROP FOREIGN KEY `fk_inventaire_meteo_meteo_id`;

-- DropForeignKey
ALTER TABLE `lieudit` DROP FOREIGN KEY `fk_lieudit_commune_id`;

-- DropForeignKey
ALTER TABLE `lieudit` DROP FOREIGN KEY `fk_lieudit_owner_id`;

-- DropForeignKey
ALTER TABLE `meteo` DROP FOREIGN KEY `fk_meteo_owner_id`;

-- DropForeignKey
ALTER TABLE `milieu` DROP FOREIGN KEY `fk_milieu_owner_id`;

-- DropForeignKey
ALTER TABLE `observateur` DROP FOREIGN KEY `fk_observateur_owner_id`;

-- DropForeignKey
ALTER TABLE `settings` DROP FOREIGN KEY `fk_settings_age_id`;

-- DropForeignKey
ALTER TABLE `settings` DROP FOREIGN KEY `fk_settings_departement_id`;

-- DropForeignKey
ALTER TABLE `settings` DROP FOREIGN KEY `fk_settings_estimation_nombre_id`;

-- DropForeignKey
ALTER TABLE `settings` DROP FOREIGN KEY `fk_settings_observateur_id`;

-- DropForeignKey
ALTER TABLE `settings` DROP FOREIGN KEY `fk_settings_sexe_id`;

-- DropForeignKey
ALTER TABLE `settings` DROP FOREIGN KEY `fk_settings_user_id`;

-- DropForeignKey
ALTER TABLE `sexe` DROP FOREIGN KEY `fk_sexe_owner_id`;

-- AlterTable
ALTER TABLE `settings` MODIFY `are_associes_displayed` BIT(1) NOT NULL DEFAULT true,
    MODIFY `is_meteo_displayed` BIT(1) NOT NULL DEFAULT true,
    MODIFY `is_distance_displayed` BIT(1) NOT NULL DEFAULT true,
    MODIFY `is_regroupement_displayed` BIT(1) NOT NULL DEFAULT true;

-- AddForeignKey
ALTER TABLE `age` ADD CONSTRAINT `fk_age_owner_id` FOREIGN KEY (`owner_id`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `classe` ADD CONSTRAINT `fk_classe_owner_id` FOREIGN KEY (`owner_id`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `commune` ADD CONSTRAINT `fk_commune_departement_id` FOREIGN KEY (`departement_id`) REFERENCES `departement`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `commune` ADD CONSTRAINT `fk_commune_owner_id` FOREIGN KEY (`owner_id`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comportement` ADD CONSTRAINT `fk_comportement_owner_id` FOREIGN KEY (`owner_id`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `departement` ADD CONSTRAINT `fk_departement_owner_id` FOREIGN KEY (`owner_id`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `donnee` ADD CONSTRAINT `fk_donnee_age_id` FOREIGN KEY (`age_id`) REFERENCES `age`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `donnee` ADD CONSTRAINT `fk_donnee_espece_id` FOREIGN KEY (`espece_id`) REFERENCES `espece`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `donnee` ADD CONSTRAINT `fk_donnee_estimation_distance_id` FOREIGN KEY (`estimation_distance_id`) REFERENCES `estimation_distance`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `donnee` ADD CONSTRAINT `fk_donnee_estimation_nombre_id` FOREIGN KEY (`estimation_nombre_id`) REFERENCES `estimation_nombre`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `donnee` ADD CONSTRAINT `fk_donnee_inventaire_id` FOREIGN KEY (`inventaire_id`) REFERENCES `inventaire`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `donnee` ADD CONSTRAINT `fk_donnee_sexe_id` FOREIGN KEY (`sexe_id`) REFERENCES `sexe`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `donnee_comportement` ADD CONSTRAINT `fk_donnee_comportement_comportement_id` FOREIGN KEY (`comportement_id`) REFERENCES `comportement`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `donnee_comportement` ADD CONSTRAINT `fk_donnee_comportement_donnee_id` FOREIGN KEY (`donnee_id`) REFERENCES `donnee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `donnee_milieu` ADD CONSTRAINT `fk_donnee_milieu_donnee_id` FOREIGN KEY (`donnee_id`) REFERENCES `donnee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `donnee_milieu` ADD CONSTRAINT `fk_donnee_milieu_milieu_id` FOREIGN KEY (`milieu_id`) REFERENCES `milieu`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `espece` ADD CONSTRAINT `fk_espece_classe_id` FOREIGN KEY (`classe_id`) REFERENCES `classe`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `espece` ADD CONSTRAINT `fk_espece_owner_id` FOREIGN KEY (`owner_id`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `estimation_distance` ADD CONSTRAINT `fk_estimation_distance_owner_id` FOREIGN KEY (`owner_id`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `estimation_nombre` ADD CONSTRAINT `fk_estimation_nombre_owner_id` FOREIGN KEY (`owner_id`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventaire` ADD CONSTRAINT `fk_inventaire_lieudit_id` FOREIGN KEY (`lieudit_id`) REFERENCES `lieudit`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventaire` ADD CONSTRAINT `fk_inventaire_observateur_id` FOREIGN KEY (`observateur_id`) REFERENCES `observateur`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventaire` ADD CONSTRAINT `fk_inventaire_owner_id` FOREIGN KEY (`owner_id`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventaire_associe` ADD CONSTRAINT `fk_inventaire_associe_inventaire_id` FOREIGN KEY (`inventaire_id`) REFERENCES `inventaire`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventaire_associe` ADD CONSTRAINT `fk_inventaire_associe_observateur_id` FOREIGN KEY (`observateur_id`) REFERENCES `observateur`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventaire_meteo` ADD CONSTRAINT `fk_inventaire_meteo_inventaire_id` FOREIGN KEY (`inventaire_id`) REFERENCES `inventaire`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventaire_meteo` ADD CONSTRAINT `fk_inventaire_meteo_meteo_id` FOREIGN KEY (`meteo_id`) REFERENCES `meteo`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lieudit` ADD CONSTRAINT `fk_lieudit_commune_id` FOREIGN KEY (`commune_id`) REFERENCES `commune`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lieudit` ADD CONSTRAINT `fk_lieudit_owner_id` FOREIGN KEY (`owner_id`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `meteo` ADD CONSTRAINT `fk_meteo_owner_id` FOREIGN KEY (`owner_id`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `milieu` ADD CONSTRAINT `fk_milieu_owner_id` FOREIGN KEY (`owner_id`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `observateur` ADD CONSTRAINT `fk_observateur_owner_id` FOREIGN KEY (`owner_id`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `settings` ADD CONSTRAINT `fk_settings_age_id` FOREIGN KEY (`default_age_id`) REFERENCES `age`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `settings` ADD CONSTRAINT `fk_settings_departement_id` FOREIGN KEY (`default_departement_id`) REFERENCES `departement`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `settings` ADD CONSTRAINT `fk_settings_estimation_nombre_id` FOREIGN KEY (`default_estimation_nombre_id`) REFERENCES `estimation_nombre`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `settings` ADD CONSTRAINT `fk_settings_observateur_id` FOREIGN KEY (`default_observateur_id`) REFERENCES `observateur`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `settings` ADD CONSTRAINT `fk_settings_sexe_id` FOREIGN KEY (`default_sexe_id`) REFERENCES `sexe`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `settings` ADD CONSTRAINT `fk_settings_user_id` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sexe` ADD CONSTRAINT `fk_sexe_owner_id` FOREIGN KEY (`owner_id`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
