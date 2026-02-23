// Import global profile functions and server URL
import { getGlobalProfile, serverUrl } from "./config.js";
// Import logout button functionality
import { logoutButton } from "./auth.js";

// Import all task/filter related functions from filters.js
import {
    filterCheckbox, onLoadPageFunction, filterBtnFunction,
    taskUpdate, updateCancel, updateConfirm, newOrigin, newReader, 
    settingsPage, updateStatus, showHideDiv, openCloseAllTasks,
    openCloseByStatus
} from "./filters.js"

// Initialize page functions
onLoadPageFunction()      // Load initial page setup
filterCheckbox()          // Setup checkbox filters
filterBtnFunction()       // Setup filter buttons
taskUpdate()              // Enable task update functionality
updateCancel()            // Handle cancel update action
updateConfirm()           // Handle confirm update action
newOrigin()               // Setup new origin functionality
newReader()               // Setup new reader functionality
settingsPage()            // Setup settings page navigation
logoutButton()            // Initialize logout button
updateStatus()            // Handle task status updates
showHideDiv()             // Setup show/hide div elements
openCloseAllTasks()       // Setup open/close all tasks functionality
openCloseByStatus()       // Setup open/close tasks by status functionality

// Execute when window finishes loading
window.onload = function(){
    // Get the global user profile
    const profile = getGlobalProfile() 

    // Setup click event on "New Task" button to navigate to task creation page
    document.getElementById('task-new-btn-id').addEventListener('click', function(){
        window.location.href = `${serverUrl}/tasks/tasks`
    })
}
