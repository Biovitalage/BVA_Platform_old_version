from django.db import migrations

class Migration(migrations.Migration):

    dependencies = [
        ('BioVitalAge', '0001_initial'),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
            -- Controlla se la colonna esiste, se no la aggiunge
            SET @col_exists = 0;
            SELECT COUNT(*) INTO @col_exists 
            FROM information_schema.columns 
            WHERE table_schema = DATABASE() 
            AND table_name = 'BioVitalAge_diagnosi' 
            AND column_name = 'rischi';

            SET @sql = IF(@col_exists = 0, 
                'ALTER TABLE `BioVitalAge_diagnosi` ADD COLUMN `rischi` longtext NULL;', 
                'SELECT "Column already exists" as message;'
            );
            PREPARE stmt FROM @sql;
            EXECUTE stmt;
            DEALLOCATE PREPARE stmt;
            """,
            reverse_sql="ALTER TABLE `BioVitalAge_diagnosi` DROP COLUMN IF EXISTS `rischi`;"
        )
    ]