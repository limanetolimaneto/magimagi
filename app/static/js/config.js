// Base URL of the backend server
export const serverUrl = "https://german-smug-respectfully.ngrok-free.dev"

// Function to store the global user profile in localStorage
export function setGlobalProfile(profile){
    localStorage.setItem('userProfile', JSON.stringify(profile));
}

// Function to retrieve the global user profile from localStorage
export function getGlobalProfile(){
    const profileString = localStorage.getItem('userProfile');
    // Parse the stored JSON string back into an object, or return undefined if not set
    return profileString ? JSON.parse(profileString) : undefined;
}
