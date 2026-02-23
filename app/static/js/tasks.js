// Import server URL and popup button functionality
import { serverUrl } from "./config.js";
import { popupOkButton } from "./auth.js";

// Import all helper functions for task handling and page interactions
import {    
    getCheckedOriginValue, getCheckedStatusValue, setCurrentDateTime, buttonChooseOrigin, 
    buttonConfirmOrigin, buttonChooseStatus, buttonConfirmStatus, buttonChooseEditable,
    buttonConfirmEditable, buttonChooseVisibility, buttonConfirmVisibility,
    buttonChooseReader, buttonConfirmReader, allNoneCheckEditable, editableArray,
    allNoneCheckVisibility, visibilityArray, allNoneCheckReader, readerArray, pageLoad,
    backToMain 
} from "./hiddenFunctions.js";

// Initialize page and set up interactive elements
pageLoad()                  // Run initial page setup
setCurrentDateTime()        // Set the current date and time in the form
buttonChooseOrigin()        // Enable origin selection button
buttonChooseStatus()        // Enable status selection button
buttonConfirmOrigin()       // Confirm selected origin
buttonConfirmStatus()       // Confirm selected status
buttonChooseEditable()      // Enable editable users selection
buttonConfirmEditable()     // Confirm editable users
buttonChooseVisibility()    // Enable visibility selection
buttonConfirmVisibility()   // Confirm visibility users
buttonChooseReader()        // Enable reader selection
buttonConfirmReader()       // Confirm reader users
allNoneCheckEditable()      // Handle "check all/none" for editable users
allNoneCheckVisibility()    // Handle "check all/none" for visibility users
allNoneCheckReader()        // Handle "check all/none" for reader users
backToMain()                // Setup back button to return to main page

// ====================== BUTTON SAVE TASK ======================
// Handle click event on "Save Task" button to record a new task
document.getElementById("task-save-btn-id").addEventListener('click', async(event) => {
    // Get form values
    const remindme = document.getElementById("task-remindme-id").value
    const includeCoauthor = document.getElementById("task-coauthor-id").checked
    const shareLeader = document.getElementById("task-leader-id").checked
    var dateTime = document.getElementById("task-origin-date-id").value
    const dateObj = dateTime.split('T') ? dateTime.split('T')[0] : null
    const timeObj = dateTime.split('T') ? dateTime.split('T')[1] : null
    var deadLine = document.getElementById("task-deadline-id").value
    let origins = getCheckedOriginValue()[0]
    const status = (getCheckedStatusValue() == null) ? "DRAFT" : getCheckedStatusValue();
    const description = document.getElementById("task-description-id").value
    const comments = document.getElementById("task-comments-id").value
    const instructions = document.getElementById("task-instructions-id").value
    const editableUsersArray = editableArray()
    const visibilityUsersArray = visibilityArray()
    const readersArray = readerArray()

    // Send POST request to save task on the backend
    const response = await fetch(`${serverUrl}/tasks/save-task`,{
        method:'POST',
        headers:{
            "User-Agent": "Mozilla/5.0",
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
            'origin-date' : dateObj,
            'origin-time' : timeObj,
            'deadline': deadLine,
            'description' : description,
            'comments': comments,
            'instructions' : instructions,
            'origin_id' : origins,
            'status' : status,       
            'editableArray': editableUsersArray,
            'visibilityArray' : visibilityUsersArray,
            'readerArray' : readersArray,
            'remindme' : remindme,
            'includeCoauthor' : includeCoauthor,
            'shareLeader' : shareLeader,
        })
    })

    // Process backend response
    const resp = await response.json()
    if (resp && (resp.title == 'ok' )){
        // Show success popup
        document.getElementById('popup-id-back').style.display = 'block'
        document.getElementById('popup-title-label').innerText = 'SUCCESS'
    } else {
        // Show error popup
        document.getElementById('popup-id-back').style.display = 'block'
        document.getElementById('popup-title-label').innerText = 'ERROR'
    }

    // Display backend message in the popup
    document.getElementById('popup-message-label').innerText = 'MESSAGE'
    document.getElementById('popup-message').innerText = resp.message

    // Setup popup OK button and reset the form after closing
    popupOkButton(true)
})
