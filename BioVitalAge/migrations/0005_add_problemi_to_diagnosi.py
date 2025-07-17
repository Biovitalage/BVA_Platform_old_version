from django.db import migrations

class Migration(migrations.Migration):

    dependencies = [
        ('BioVitalAge', '0001_initial'),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
                ALTER TABLE `BioVitalAge_diagnosi` ADD COLUMN `problemi` longtext NULL;
            """,
            reverse_sql="""
                ALTER TABLE `BioVitalAge_diagnosi` DROP COLUMN `problemi`;
            """
        )
    ]