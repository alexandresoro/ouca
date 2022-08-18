-- CreateTable
CREATE TABLE `age` (
    `id` SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `libelle` VARCHAR(100) NOT NULL,
    `owner_id` VARCHAR(191) NULL,

    UNIQUE INDEX `unique_libelle`(`libelle`),
    INDEX `fk_age_owner_id`(`owner_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `classe` (
    `id` SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `libelle` VARCHAR(100) NOT NULL,
    `owner_id` VARCHAR(191) NULL,

    UNIQUE INDEX `unique_libelle`(`libelle`),
    INDEX `fk_classe_owner_id`(`owner_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `commune` (
    `id` SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `departement_id` SMALLINT UNSIGNED NOT NULL,
    `code` SMALLINT UNSIGNED NOT NULL,
    `nom` VARCHAR(100) NOT NULL,
    `owner_id` VARCHAR(191) NULL,

    INDEX `fk_commune_owner_id`(`owner_id`),
    UNIQUE INDEX `unique_departement_code`(`departement_id`, `code`),
    UNIQUE INDEX `unique_departement_nom`(`departement_id`, `nom`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `comportement` (
    `id` SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(6) NOT NULL,
    `libelle` VARCHAR(100) NOT NULL,
    `nicheur` ENUM('possible', 'probable', 'certain') NULL,
    `owner_id` VARCHAR(191) NULL,

    UNIQUE INDEX `unique_code`(`code`),
    UNIQUE INDEX `unique_libelle`(`libelle`),
    INDEX `fk_comportement_owner_id`(`owner_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `departement` (
    `id` SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(100) NOT NULL,
    `owner_id` VARCHAR(191) NULL,

    UNIQUE INDEX `unique_code`(`code`),
    INDEX `fk_departement_owner_id`(`owner_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `donnee` (
    `id` MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `inventaire_id` MEDIUMINT UNSIGNED NOT NULL,
    `espece_id` MEDIUMINT UNSIGNED NOT NULL,
    `sexe_id` SMALLINT UNSIGNED NOT NULL,
    `age_id` SMALLINT UNSIGNED NOT NULL,
    `estimation_nombre_id` SMALLINT UNSIGNED NOT NULL,
    `nombre` SMALLINT UNSIGNED NULL,
    `estimation_distance_id` SMALLINT UNSIGNED NULL,
    `distance` SMALLINT UNSIGNED NULL,
    `commentaire` TEXT NULL,
    `regroupement` SMALLINT UNSIGNED NULL,
    `date_creation` DATETIME(0) NOT NULL,

    INDEX `fk_donnee_age_id`(`age_id`),
    INDEX `fk_donnee_espece_id`(`espece_id`),
    INDEX `fk_donnee_estimation_distance_id`(`estimation_distance_id`),
    INDEX `fk_donnee_estimation_nombre_id`(`estimation_nombre_id`),
    INDEX `fk_donnee_inventaire_id`(`inventaire_id`),
    INDEX `fk_donnee_sexe_id`(`sexe_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `donnee_comportement` (
    `comportement_id` SMALLINT UNSIGNED NOT NULL,
    `donnee_id` MEDIUMINT UNSIGNED NOT NULL,

    INDEX `fk_donnee_comportement_comportement_id`(`comportement_id`),
    PRIMARY KEY (`donnee_id`, `comportement_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `donnee_milieu` (
    `milieu_id` SMALLINT UNSIGNED NOT NULL,
    `donnee_id` MEDIUMINT UNSIGNED NOT NULL,

    INDEX `fk_donnee_milieu_milieu_id`(`milieu_id`),
    PRIMARY KEY (`donnee_id`, `milieu_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `espece` (
    `id` MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `classe_id` SMALLINT UNSIGNED NULL,
    `code` VARCHAR(20) NOT NULL,
    `nom_francais` VARCHAR(100) NOT NULL,
    `nom_latin` VARCHAR(100) NOT NULL,
    `owner_id` VARCHAR(191) NULL,

    UNIQUE INDEX `unique_code`(`code`),
    UNIQUE INDEX `unique_nom_francais`(`nom_francais`),
    UNIQUE INDEX `unique_nom_latin`(`nom_latin`),
    INDEX `fk_espece_classe_id`(`classe_id`),
    INDEX `fk_espece_owner_id`(`owner_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `estimation_distance` (
    `id` SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `libelle` VARCHAR(100) NOT NULL,
    `owner_id` VARCHAR(191) NULL,

    UNIQUE INDEX `unique_libelle`(`libelle`),
    INDEX `fk_estimation_distance_owner_id`(`owner_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `estimation_nombre` (
    `id` SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `libelle` VARCHAR(100) NOT NULL,
    `non_compte` BIT(1) NOT NULL,
    `owner_id` VARCHAR(191) NULL,

    UNIQUE INDEX `unique_libelle`(`libelle`),
    INDEX `fk_estimation_nombre_owner_id`(`owner_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventaire` (
    `id` MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `observateur_id` SMALLINT UNSIGNED NOT NULL,
    `date` DATE NOT NULL,
    `heure` VARCHAR(5) NULL,
    `duree` VARCHAR(5) NULL,
    `lieudit_id` MEDIUMINT UNSIGNED NOT NULL,
    `altitude` SMALLINT UNSIGNED NULL,
    `longitude` DECIMAL(13, 6) NULL,
    `latitude` DECIMAL(13, 6) NULL,
    `coordinates_system` ENUM('gps', 'lambert93') NULL,
    `temperature` TINYINT NULL,
    `date_creation` DATETIME(0) NOT NULL,
    `owner_id` VARCHAR(191) NULL,

    INDEX `fk_inventaire_lieudit_id`(`lieudit_id`),
    INDEX `fk_inventaire_observateur_id`(`observateur_id`),
    INDEX `fk_inventaire_owner_id`(`owner_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventaire_associe` (
    `inventaire_id` MEDIUMINT UNSIGNED NOT NULL,
    `observateur_id` SMALLINT UNSIGNED NOT NULL,

    INDEX `fk_inventaire_associe_observateur_id`(`observateur_id`),
    PRIMARY KEY (`inventaire_id`, `observateur_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventaire_meteo` (
    `meteo_id` SMALLINT UNSIGNED NOT NULL,
    `inventaire_id` MEDIUMINT UNSIGNED NOT NULL,

    INDEX `fk_inventaire_meteo_meteo_id`(`meteo_id`),
    PRIMARY KEY (`inventaire_id`, `meteo_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lieudit` (
    `id` MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `commune_id` SMALLINT UNSIGNED NOT NULL,
    `nom` VARCHAR(150) NOT NULL,
    `altitude` SMALLINT UNSIGNED NOT NULL,
    `longitude` DECIMAL(13, 6) NOT NULL,
    `latitude` DECIMAL(16, 6) NOT NULL,
    `coordinates_system` ENUM('gps', 'lambert93') NOT NULL,
    `owner_id` VARCHAR(191) NULL,

    INDEX `fk_lieudit_owner_id`(`owner_id`),
    UNIQUE INDEX `unique_commune_nom`(`commune_id`, `nom`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `meteo` (
    `id` SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `libelle` VARCHAR(100) NOT NULL,
    `owner_id` VARCHAR(191) NULL,

    UNIQUE INDEX `unique_libelle`(`libelle`),
    INDEX `fk_meteo_owner_id`(`owner_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `milieu` (
    `id` SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(6) NOT NULL,
    `libelle` VARCHAR(100) NOT NULL,
    `owner_id` VARCHAR(191) NULL,

    UNIQUE INDEX `unique_code`(`code`),
    UNIQUE INDEX `unique_libelle`(`libelle`),
    INDEX `fk_milieu_owner_id`(`owner_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `observateur` (
    `id` SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `libelle` VARCHAR(100) NOT NULL,
    `owner_id` VARCHAR(191) NULL,

    UNIQUE INDEX `unique_libelle`(`libelle`),
    INDEX `fk_observateur_owner_id`(`owner_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `settings` (
    `id` SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `default_observateur_id` SMALLINT UNSIGNED NULL,
    `default_departement_id` SMALLINT UNSIGNED NULL,
    `default_age_id` SMALLINT UNSIGNED NULL,
    `default_sexe_id` SMALLINT UNSIGNED NULL,
    `default_estimation_nombre_id` SMALLINT UNSIGNED NULL,
    `default_nombre` SMALLINT UNSIGNED NULL,
    `are_associes_displayed` BIT(1) NOT NULL DEFAULT (b'1'),
    `is_meteo_displayed` BIT(1) NOT NULL DEFAULT (b'1'),
    `is_distance_displayed` BIT(1) NOT NULL DEFAULT (b'1'),
    `is_regroupement_displayed` BIT(1) NOT NULL DEFAULT (b'1'),
    `coordinates_system` ENUM('gps', 'lambert93') NOT NULL DEFAULT 'gps',
    `user_id` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `unique_user_id`(`user_id`),
    INDEX `fk_settings_age_id`(`default_age_id`),
    INDEX `fk_settings_departement_id`(`default_departement_id`),
    INDEX `fk_settings_estimation_nombre_id`(`default_estimation_nombre_id`),
    INDEX `fk_settings_observateur_id`(`default_observateur_id`),
    INDEX `fk_settings_sexe_id`(`default_sexe_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sexe` (
    `id` SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `libelle` VARCHAR(100) NOT NULL,
    `owner_id` VARCHAR(191) NULL,

    UNIQUE INDEX `unique_libelle`(`libelle`),
    INDEX `fk_sexe_owner_id`(`owner_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user` (
    `id` VARCHAR(191) NOT NULL,
    `username` VARCHAR(50) NOT NULL,
    `password` VARCHAR(161) NOT NULL,
    `role` ENUM('admin', 'contributor') NOT NULL,
    `first_name` VARCHAR(50) NOT NULL,
    `last_name` VARCHAR(50) NULL,

    UNIQUE INDEX `unique_username`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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
