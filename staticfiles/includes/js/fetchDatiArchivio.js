/*  -----------------------------------------------------------------------------------------------
  Call JSON to archive platform
--------------------------------------------------------------------------------------------------- */
export async function renderingRisultati() {
    const archivePlatform = [];

    try {
        const response = await fetch(
            "/static/includes/json/ArchivioEsami.json"
        );
        const data = await response.json();
        archivePlatform.push(data);
    } catch (error) {
        console.error("Error:", error);
    }

    return archivePlatform;
}
