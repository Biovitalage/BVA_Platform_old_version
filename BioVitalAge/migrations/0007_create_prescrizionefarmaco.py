from django.db import migrations

class Migration(migrations.Migration):

    dependencies = [
        ('BioVitalAge', '0001_initial'),  # o l'ultima migration valida che hai
    ]

    operations = [
        migrations.RunSQL(
            sql="""
                CREATE TABLE `BioVitalAge_prescrizionefarmaco` (
                    `id` bigint AUTO_INCREMENT NOT NULL PRIMARY KEY,
                    `data_prescrizione` datetime(6) NOT NULL,
                    `data_inizio` date NOT NULL,
                    `data_fine` date NULL,
                    `posologia_personalizzata` longtext NULL,
                    `note_medico` longtext NULL,
                    `diagnosi` varchar(500) NULL,
                    `stato` varchar(20) NOT NULL,
                    `created_at` datetime(6) NOT NULL,
                    `updated_at` datetime(6) NOT NULL,
                    `farmaco_id` bigint NOT NULL,
                    `paziente_id` bigint NOT NULL,
                    `medico_id` bigint NOT NULL
                ) ENGINE=InnoDB;
                ALTER TABLE `BioVitalAge_prescrizionefarmaco` ADD CONSTRAINT `BioVitalAge_prescriz_farmaco_id_f70e2170_fk_BioVitalA` FOREIGN KEY (`farmaco_id`) REFERENCES `BioVitalAge_farmaco` (`id`);
                ALTER TABLE `BioVitalAge_prescrizionefarmaco` ADD CONSTRAINT `BioVitalAge_prescriz_paziente_id_a1dab6d7_fk_BioVitalA` FOREIGN KEY (`paziente_id`) REFERENCES `BioVitalAge_tabellapazienti` (`id`);
                ALTER TABLE `BioVitalAge_prescrizionefarmaco` ADD CONSTRAINT `BioVitalAge_prescriz_medico_id_7178f09c_fk_BioVitalA` FOREIGN KEY (`medico_id`) REFERENCES `BioVitalAge_utentiregistraticredenziali` (`id`);
                ALTER TABLE `BioVitalAge_prescrizionefarmaco` ADD CONSTRAINT `BioVitalAge_prescrizione_paziente_id_farmaco_id_d_eb8b7438_uniq` UNIQUE (`paziente_id`, `farmaco_id`, `data_prescrizione`);
            """,
            reverse_sql="DROP TABLE IF EXISTS `BioVitalAge_prescrizionefarmaco`;"
        )
    ]