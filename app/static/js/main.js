// Import the backend server URL from config.js
import { serverUrl } from "./config.js"

// Import authentication functions and popup control from auth.js
import { auth, popupOkButton } from "./auth.js"; 

// ===============================================================
// Call the authentication function to check user login or session
auth();
// ===============================================================


// Initialize the popup OK button with 'false' (hidden or inactive)
popupOkButton(false)

// Button Back - Redirect to Home Page 
document.getElementById("back-home-button").addEventListener('click', function () {
    window.location = `${serverUrl}`
})