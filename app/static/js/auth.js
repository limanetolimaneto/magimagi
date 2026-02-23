// Import global configuration and helper functions
import { setGlobalProfile, serverUrl } from "./config.js"
import { setCurrentDateTime } from "./hiddenFunctions.js"

// Function to handle user authentication
export function auth(){
    // Listen for click event on the sign-in button
    document.getElementById("signin-btn").addEventListener('click', async() => {
        // Send authentication request to the backend
        const response = await fetch(`${serverUrl}/users/signin`,{
                            method : 'POST',
                            headers:{
                                "User-Agent": "Mozilla/5.0",
                                "Accept": "application/json",
                                "Content-Type": "application/json"
                            },
                            credentials: "include",
                            body: JSON.stringify({
                                'email':document.getElementById('login-username').value,
                                'password':document.getElementById('login-password').value
                            }),
                        })
        const json = await response.json()
        // Check response and redirect if successful
        if (response.ok && json.success) {
            setGlobalProfile(json.profile) // Set global user profile
            window.location.href = json.redirect_url; // Redirect to the specified page
        } else {
            // Display error popup if login fails
            document.getElementById('popup-id-back').style.display = 'block'
            document.getElementById('popup-title-label').innerText = 'ERROR'
            document.getElementById('popup-message-label').innerText = 'MESSAGE'
            document.getElementById('popup-message').innerText = 'INVALID USER/PASSWORD - CONTACT THE ADMIN USER'
        }
    })
}

// Function to reset the new task form to default values
function resetNewTaskForm() {
    setCurrentDateTime()  // Set the current date and time
    document.getElementById("task-deadline-id").value = ""  
    document.getElementsByName("origins")[0].checked = true
    document.getElementById('origins-0').value = '0'
    document.getElementById('origins-0').value = '0'
    document.getElementById('task-btn-origins-id').textContent = 'NONE'
    document.getElementsByName("status")[0].checked = true
    document.getElementById('task-btn-status-id').textContent = 'SKATCH'
    document.getElementById('task-description-id').value = ""
    document.getElementById('task-instructions-id').value = ""
    document.getElementById('task-comments-id').value = ""

    // Lock or unlock editable fields
    document.getElementById('task-btn-editable-id').textContent = 'LOCKED'
    const divEditable = document.getElementById('hidden-div-editable-id').getElementsByTagName('p')
    Array.from(divEditable).forEach(element => {
        element.querySelector('input[type="checkbox"]')? element.querySelector('input[type="checkbox"]').checked=false:''
    }); 
    document.getElementById("all-none-check-users-id").innerText = "CHECK ALL"
    document.getElementById('all-none-check-users-id')? document.getElementById('all-none-check-users-id').checked = false : ''
    
    // Reset visibility checkboxes
    document.getElementById('task-btn-visibility-id').textContent = 'PRIVATE'
    const divVisibility = document.getElementById('hidden-div-visibility-id').getElementsByTagName('p')
    Array.from(divVisibility).forEach(element => {
        element.querySelector('input[type="checkbox"]')? element.querySelector('input[type="checkbox"]').checked=false:''
    });
    document.getElementById('all-none-check-visibility-id').innerText = "CHECK ALL"
    document.getElementById('all-none-check-visibility-id').checked = false
    
    // Reset reader checkboxes
    document.getElementById('task-btn-reader-id').textContent = 'NO READER'
    const divReader = document.getElementById('hidden-div-reader-id').getElementsByTagName('p')
    Array.from(divReader).forEach(element => {
        element.querySelector('input[type="checkbox"]')? element.querySelector('input[type="checkbox"]').checked=false:''
    });
    document.getElementById('all-none-check-reader-id').innerText = "CHECK ALL"
    document.getElementById('all-none-check-reader-id').checked = false
    
    // Reset coauthor, leader, and reminder fields
    document.getElementById("task-coauthor-id").checked = false
    document.getElementById("task-leader-id").checked = false
    document.getElementById("task-remindme-id").value = ""
}

// Function to handle popup OK button click
export function popupOkButton(reset) {
    document.getElementById('popup-button').addEventListener('click', function () {
        document.getElementById('popup-id-back').style.display = 'none' // Hide popup
        if(reset){resetNewTaskForm()} // Reset form if requested
    })
}

// Function to handle logout button click
export function logoutButton(){
    document.getElementById('logout-btn-id').addEventListener('click', async () => {
        const response = await fetch(`${serverUrl}/users/logout`,{
                            method : 'POST',
                            headers:{
                                "User-Agent": "Mozilla/5.0",
                                "Accept": "application/json",
                                "Content-Type": "application/json"
                            },
                            credentials: "include",
                        })
        const json = await response.json()
        // Check response and redirect if successful
        if (response.ok && json.success) {
            setGlobalProfile('')
            window.location = `${serverUrl}/users` // Redirect to user login page
        }
       
    })
}
