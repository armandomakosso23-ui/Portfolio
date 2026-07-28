// IMPORTER CV
const uploadCV = document.getElementById("uploadCV");
if (uploadCV) {
    uploadCV.addEventListener("change", function() {
        const file = this.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("cv", file);

        alert("CV importé avec succès !");
    });
}

// SUPPRIMER CV
const deleteCV = document.getElementById("deleteCV");
if (deleteCV) {
    deleteCV.addEventListener("click", function() {
        const confirmDelete = confirm("Voulez-vous vraiment supprimer le CV ?");
        if (confirmDelete) {
            alert("CV supprimé !");
        }
    });
}
