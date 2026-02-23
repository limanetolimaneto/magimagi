import { serverUrl } from "./config.js";

// NEW ORIGIN CONFIRM BUTTON FUNCTION ======================
document.getElementById('origin-confirm-btn-id-id').addEventListener('click',function(){
    fetch(`${serverUrl}/origins/new-origin-save`,{
        method:'POST',
        headers:{"User-Agent": "Mozilla/5.0",
                "Accept": "application/json",
                "Content-Type": "application/json"},
        credentials: "include",
        body: JSON.stringify({
            "description" : document.getElementById("new-origin-form-description-id").value,
            "email" : document.getElementById("new-origin-form-email-id").value,
            "type" : document.getElementById("new-origin-form-type-id").value,
            "notes" : document.getElementById("new-origin-form-notes-id").value
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


// NEW ORIGIN CANCEL BUTTON FUNCTION ======================
document.getElementById('origin-cancel-btn-id-id').addEventListener('click',function(){
    window.location.href = `${serverUrl}/tasks/main-task`
})