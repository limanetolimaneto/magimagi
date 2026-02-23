import { serverUrl } from "./config.js";

// NEW READER BUTTON FUNCTION ======================
document.getElementById('reader-confirm-btn-id-id').addEventListener('click',function(){
    fetch(`${serverUrl}/readers/new-reader-save`,{
        method:'POST',
        headers:{"User-Agent": "Mozilla/5.0",
                "Accept": "application/json",
                "Content-Type": "application/json"},
        credentials: "include",
        body: JSON.stringify({
            "description" : document.getElementById("new-reader-form-description-id").value,
            "email" : document.getElementById("new-reader-form-email-id").value,
            "notes" : document.getElementById("new-reader-form-notes-id").value
        })
    })
    .then(response => {
        if (response.ok) {
            location.reload(); 
        } else {
            console.error("Error");
        }
    })
    .catch(error => {
        console.error("Error :", error);
    });
})


// NEW READER CANCEL BUTTON FUNCTION ======================
document.getElementById('reader-cancel-btn-id-id').addEventListener('click',function(){
    window.location.href = `${serverUrl}/tasks/main-task`
})