// Import the backend server URL from config.js
import { serverUrl } from "./config.js";

// ====================== CHECK RADIO INPUT ======================
// Execute when the window finishes loading
window.onload = function () {
    // Get the current leader email value
    const leader = this.document.getElementById("leader-email-address-id").value
    // Get all radio inputs for leader selection
    const nodeLeader = document.getElementsByName('leader-radio-name')

    // Loop through each radio input
    nodeLeader.forEach(element => {
        // If the radio value matches the current leader, mark it as checked and style the label
        if(leader == element.value){
            element.checked = true
            const label = document.getElementById(`label_${element.id}`)
            label.style.backgroundColor = 'green'
            label.style.color = 'lightGrey'
            label.style.textTransform = 'upperCase'
            label.style.fontWeight = 'bold'
            label.style.borderRadius = '4px'
        }

        // Add click event to update the hidden input with the selected email
        element.addEventListener('click', function(event){
            const email = element.value
            if(event.target.checked){
                document.getElementById("leader-email-address-id").value = email
            }
        })
    });
}

// ====================== NEW LEADER BUTTON FUNCTION ======================
// Handle click event on the "Confirm New Leader" button
document.getElementById('leader-confirm-btn-id-id').addEventListener('click', function(){
    // Send new leader email to backend
    fetch(`${serverUrl}/leader/new-leader-set`,{
        method:'POST',
        headers:{
            "User-Agent": "Mozilla/5.0",
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
            "email" : document.getElementById("leader-email-address-id").value,
        })
    })
    .then(response => {
        // Reload page if request is successful
        if (response.ok) {
            location.reload(); 
        } else {
            console.error("Error"); // Log error if request fails
        }
    })
    .catch(error => {
        console.error("Error :", error); // Log network or other errors
    });
})

// ====================== SET LEADER CANCEL BUTTON FUNCTION ======================
// Handle click event on the "Cancel" button to go back to settings page
document.getElementById('leader-cancel-btn-id-id').addEventListener('click', function(){
    window.location.href = `${serverUrl}/leader/settings-page`
})
