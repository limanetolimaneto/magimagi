// Import the backend server URL from config.js
import { serverUrl } from "./config.js"

// Execute when the window finishes loading
window.onload = function name(params) {
    // Get the back button element by its ID
    const back = document.getElementById("button-back-doc")
    
    // Add click event listener to navigate back to the settings page
    back.addEventListener('click', function () {
        window.location = `${serverUrl}/leader/settings-page` // Redirect to the leader settings page
    })
}
