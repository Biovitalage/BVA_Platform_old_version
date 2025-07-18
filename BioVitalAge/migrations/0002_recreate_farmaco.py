from django.db import migrations

class Migration(migrations.Migration):

    dependencies = [
        ('BioVitalAge', '0001_initial'),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
            -- Crea la tabella solo se non esiste già
            CREATE TABLE IF NOT EXISTS `BioVitalAge_farmaco` (
                `id` bigint AUTO_INCREMENT PRIMARY KEY,
                `codice_univoco_farmaco` varchar(50) NOT NULL UNIQUE,
                `nome_farmaco` varchar(200) NOT NULL,
                `principio_attivo` varchar(200) NOT NULL,
                `cod_aic` varchar(20) NULL,
                `cod_atc` varchar(20) NULL,
                `forma_farmaceutica` varchar(100) NULL,
                `dosaggio` varchar(100) NULL,
                `posologia_adulto` longtext NULL,
                `posologia_bambino` longtext NULL,
                `indicazioni` longtext NULL,
                `controindicazioni` longtext NULL,
                `effetti_collaterali` longtext NULL,
                `apparato_sistemi` varchar(200) NULL,
                `created_at` datetime(6) NOT NULL,
                `updated_at` datetime(6) NOT NULL
            ) ENGINE=InnoDB;
            """,
            reverse_sql="DROP TABLE IF EXISTS `BioVitalAge_farmaco`;"
        )
    ]