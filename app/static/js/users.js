// Import server URL and function to get global user profile
import { serverUrl, getGlobalProfile } from "./config.js"

// Execute when the window finishes loading
window.onload = function () {

// ====================== NEW USER CONFIRM BUTTON FUNCTION ======================
// Only allow authors to create new users
if(getGlobalProfile() == 'author'){
    document.getElementById('user-confirm-btn-id-id').addEventListener('click', function(){
        // Get coauthor value if selected
        const coauthorVal = document.getElementById("user-slt-coauthor-id").value
        const coauthor = coauthorVal ? coauthorVal : null

        // Send POST request to create a new user
        fetch(`${serverUrl}/users/signup`,{
            method:'POST',
            headers:{
                "User-Agent": "Mozilla/5.0",
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
                "name" : document.getElementById("user-ipt-name-id").value,
                "email" : document.getElementById("user-ipt-email-id").value,
                "password" : document.getElementById("user-ipt-password-id").value,
                "profile" : document.getElementById("user-slt-profile-id").value,
                "coauthor" : coauthor
            })
        })
        .then(response => {
            if (response.ok) {
                location.reload(); // Reload page on success
            } else {
                console.error("Error"); // Log error if request fails
            }
        })
        .catch(error => {
            console.error("Error :", error); // Log network or other errors
        });
    })
}

// ====================== EDIT USER CANCEL BUTTON FUNCTION ======================
// Reload page when edit cancel button is clicked
document.getElementById('div-edit-btn-cancel').addEventListener('click', function(){
    location.reload(); 
})

// ====================== NEW USER CANCEL BUTTON FUNCTION ======================
// Navigate back to settings page when new user cancel button is clicked
document.getElementById('user-cancel-btn-id-id').addEventListener('click', function(){
    window.location.href = `${serverUrl}/leader/settings-page`
})

// ====================== EDIT USER BUTTON FUNCTION ======================
// Show hidden edit user div and populate fields with user data
const nodeButtonbEdit = document.getElementsByName("edit-user-id")
nodeButtonbEdit.forEach(element => {
    element.addEventListener("click", function(){
        document.getElementById("div-edit-user-hidden-main").style.display = "block"
        document.getElementById("id-edit-id").value = document.getElementById(`din_id_${this.value}`).value
        document.getElementById("id-edit-name").value = document.getElementById(`din_name_${this.value}`).value
        document.getElementById("id-edit-email").value = document.getElementById(`din_email_${this.value}`).value
        if(getGlobalProfile() == 'author'){
            document.getElementById("id-edit-profile").value = document.getElementById(`din_profile_${this.value}`).value
            document.getElementById("id-edit-coauthor").value = document.getElementById(`din_coauthor_${this.value}`).value
        } else {
            // Non-author users have limited edit access
            document.getElementById("id-edit-profile").value = 'coauthor'
            document.getElementById("id-edit-coauthor").value = '0'
        }
    })
});

// ====================== EDIT USER CONFIRM BUTTON FUNCTION ======================
// Save changes made to user information
const saveChanges = document.getElementById("div-edit-btn-confirm")
saveChanges.addEventListener("click", function(){    
    const pass = document.getElementById("id-edit-password").value
    const co = document.getElementById("id-edit-coauthor").value

    // Send PUT request to update user data
    fetch(`${serverUrl}/users/user-update`,{
        method:'PUT',
        headers:{
            "User-Agent": "Mozilla/5.0",
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
            "id" : document.getElementById("id-edit-id").value,
            "name" : document.getElementById("id-edit-name").value,
            "email" : document.getElementById("id-edit-email").value,
            "password" : (pass !== "") ? pass : null, 
            "profile" : document.getElementById("id-edit-profile").value,
            "coauthor" : (co !== "") ? co : null, 
        })
    })
    .then(response => {
        if (response.ok) {
            location.reload(); // Reload page on success
        } else {
            console.error("Error"); // Log error if request fails
        }
    })
    .catch(error => {
        console.error("Error :", error); // Log network or other errors
    });
})            
}
