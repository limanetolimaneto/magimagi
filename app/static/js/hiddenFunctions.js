import { serverUrl } from "./config.js";

// SETS CURRENT DATE/TIME INPUT VALUES  =====================================
export function setCurrentDateTime(){
    let today = new Date()
    let formattedDatetime = today.toISOString().slice(0, 16); 
    document.getElementById("task-origin-date-id").value = formattedDatetime;
}

// IT GETS THE ORIGIN RADIO INPUT VALUE =====================================
export function getCheckedOriginValue(){
    const selectedRadio = document.querySelector('input[name="origins"]:checked');
    if (selectedRadio) {
        return [selectedRadio.value, selectedRadio.dataset.detail];
    } else {
        return null; 
    }

}

// IT GETS THE STATUS RADIO INPUT VALUE =====================================
export function getCheckedStatusValue(){
    const selectedRadio = document.querySelector('input[name="status"]:checked');
    if (selectedRadio) {
        return selectedRadio.value
    } else {
        return null; 
    }
}

// CHOOSE ORIGIN FUNCTION ===================================================
export function buttonChooseOrigin(){
    document.getElementById("task-btn-origins-id").addEventListener('click', function(){
        document.getElementById('task-section-id').style.display = 'none'
        document.getElementById('hidden-div-origins-id').style.display = 'block'
    })
}

// CONFIRM ORIGIN FUNCTION ===================================================
export function buttonConfirmOrigin(){
    document.getElementById("hidden-confirm-origin-btn-id").addEventListener('click', async() => {
        document.getElementById('task-section-id').style.display = 'block'
        document.getElementById('hidden-div-origins-id').style.display = 'none'
        document.getElementById('task-btn-origins-id').textContent = getCheckedOriginValue()[1]
    })
}

// CHOOSE STATUS FUNCTION ===================================================
export function buttonChooseStatus(){
    document.getElementById("task-btn-status-id").addEventListener('click', function(){
        // if(getCheckedStatusValue()==null){
        //     document.getElementById("skatch-status").checked = true
        // }

        document.getElementById('hidden-div-status-id').style.display = 'block'
        document.getElementById('task-section-id').style.display = 'none'
    })
}

//  CONFIRM STATUS FUNCTION =================================================
export function buttonConfirmStatus(){
    document.getElementById("hidden-confirm-status-btn-id").addEventListener('click', function(){
        document.getElementById('task-btn-status-id').textContent = getCheckedStatusValue().toUpperCase()
        
        document.getElementById('hidden-div-status-id').style.display = 'none'
        document.getElementById('task-section-id').style.display = 'block'
    })
}

// CHOOSE EDITABLE FUNCTION ===================================================
export function buttonChooseEditable(){
    document.getElementById("task-btn-editable-id").addEventListener('click', function(){
        document.getElementById('hidden-div-editable-id').style.display = 'block'
        document.getElementById('task-section-id').style.display = 'none'
    })
}

//  CONFIRM EDITABLE FUNCTION =================================================
export function buttonConfirmEditable(){
    document.getElementById("hidden-confirm-editable-btn-id").addEventListener('click', function(){
        document.getElementById('hidden-div-editable-id').style.display = 'none'
        document.getElementById('task-section-id').style.display = 'block'
        const allP = document.getElementById("hidden-div-editable-id").querySelectorAll('p');
        document.getElementById('task-btn-editable-id').textContent = 'LOCKED';
        for (const p of allP) {
            if(p.querySelector('input')){
                if (p.querySelector('input').checked == true) {
                    document.getElementById('task-btn-editable-id').textContent = 'UNLOCKED';
                    break; 
                }
            }
        }
    })
}

// CHOOSE VISIBILITY FUNCTION ===================================================
export function buttonChooseVisibility(){
    document.getElementById("task-btn-visibility-id").addEventListener('click', function(){
        // if(getCheckedStatusValue()==null){
        //     document.getElementById("skatch-status").checked = true
        // }

        document.getElementById('hidden-div-visibility-id').style.display = 'block'
        document.getElementById('task-section-id').style.display = 'none'
    })
}

//  CONFIRM VISIBILITY FUNCTION =================================================
export function buttonConfirmVisibility(){
    document.getElementById("hidden-confirm-visibility-btn-id").addEventListener('click', function(){
        document.getElementById('hidden-div-visibility-id').style.display = 'none'
        document.getElementById('task-section-id').style.display = 'block'
        const allP = document.getElementById("hidden-div-visibility-id").querySelectorAll('p');
        document.getElementById('task-btn-visibility-id').textContent = 'PRIVATE';
        for (const p of allP) {
            if(p.querySelector('input')){
                if (p.querySelector('input').checked == true) {
                    document.getElementById('task-btn-visibility-id').textContent = 'VISIBLE';
                    break; 
                }
            }
        }
        
    })
}

// CHOOSE READER FUNCTION ===================================================
export function buttonChooseReader(){
    document.getElementById("task-btn-reader-id").addEventListener('click', function(){
        document.getElementById('hidden-div-reader-id').style.display = 'block'
        document.getElementById('task-section-id').style.display = 'none'
    })
}

//  CONFIRM READER FUNCTION =================================================
export function buttonConfirmReader(){
    document.getElementById("hidden-confirm-reader-btn-id").addEventListener('click', function(){
        document.getElementById('hidden-div-reader-id').style.display = 'none'
        document.getElementById('task-section-id').style.display = 'block'
        const allP = document.getElementById("hidden-div-reader-id").querySelectorAll('p');
        document.getElementById('task-btn-reader-id').textContent = 'NO READER';
        for (const p of allP) {
            if(p.querySelector('input')){
                if (p.querySelector('input').checked == true) {
                    document.getElementById('task-btn-reader-id').textContent = 'WITH READER';
                    break; 
                }
            }
        }
    })
}

// CHECK ALL/NONE EDITABLE USERS ============================================ 
export function allNoneCheckEditable(){
    let allNoneLabel = document.getElementById("all-none-check-users-id")
    allNoneLabel.innerText = 'CHECK ALL'
    allNoneLabel.classList.add('all-none-check-users-label-class')
    document.getElementById("all-none-check-users-id").addEventListener('click',function(event){
        event.preventDefault
        if (event.target.checked){
            document.getElementById("all-none-check-users-id").innerText = 'UNCHECK ALL'
            const allP = document.getElementById("hidden-div-editable-id").querySelectorAll('p');
            allP.forEach(p => {
                if(p.querySelector('input')){
                    p.querySelector('input').checked = true
                }
                
            });
        }else{
            const allP = document.getElementById("hidden-div-editable-id").querySelectorAll('p');
            allP.forEach(p => {
                if(p.querySelector('input')){
                    p.querySelector('input').checked = false
                }
                
            });
            document.getElementById("all-none-check-users-id").innerText = 'CHECK ALL'
        }
    })
}

// CREATE EDITABLE USERS ARRAY =============================================== 
export function editableArray(){
    let obj = []
    const allP = document.getElementById("hidden-div-editable-id").querySelectorAll('p');
    allP.forEach(p => {
        if(p.querySelector('input') && p.querySelector('input').checked == true){
            obj.push(p.querySelector('input').value)
        }
                
    });
    return obj
}


// CHECK ALL/NONE VISIBILITY USERS =========================================== 
export function allNoneCheckVisibility(){
    let allNoneLabel = document.getElementById("all-none-check-visibility-id")
    allNoneLabel.innerText = 'CHECK ALL'
    allNoneLabel.classList.add('all-none-check-visibility-label-class')
    document.getElementById("all-none-check-visibility-id").addEventListener('click',function(event){
        if (event.target.checked){
            document.getElementById("all-none-check-visibility-id").innerText = 'UNCHECK ALL'
            const allP = document.getElementById("hidden-div-visibility-id").querySelectorAll('p');
            allP.forEach(p => {
                if(p.querySelector('input')){
                    p.querySelector('input').checked = true
                }
                
            });
        }else{
            const allP = document.getElementById("hidden-div-visibility-id").querySelectorAll('p');
            allP.forEach(p => {
                if(p.querySelector('input')){
                    p.querySelector('input').checked = false
                }
                
            });
            document.getElementById("all-none-check-visibility-id").innerText = 'CHECK ALL'
        }
    })
}

// CREATE VISIBILITY USERS ARRAY ============================================= 
export function visibilityArray(){
    let obj = []
    const allP = document.getElementById("hidden-div-visibility-id").querySelectorAll('p');
    allP.forEach(p => {
        if(p.querySelector('input') && p.querySelector('input').checked == true){
            obj.push(p.querySelector('input').value)
        }
                
    });
    return obj
}

// CHECK ALL/NONE READER ===================================================== 
export function allNoneCheckReader(){
    let allNoneLabel = document.getElementById("all-none-check-reader-id")
    allNoneLabel.innerText = 'CHECK ALL'
    allNoneLabel.classList.add('all-none-check-reader-label-class')
    document.getElementById("all-none-check-reader-id").addEventListener('click',function(event){
        if (event.target.checked){
            document.getElementById("all-none-check-reader-id").innerText = 'UNCHECK ALL'
            const allP = document.getElementById("hidden-div-reader-id").querySelectorAll('p');
            allP.forEach(p => {
                if(p.querySelector('input')){
                    p.querySelector('input').checked = true
                }
                
            });
        }else{
            const allP = document.getElementById("hidden-div-reader-id").querySelectorAll('p');
            allP.forEach(p => {
                if(p.querySelector('input')){
                    p.querySelector('input').checked = false
                }
                
            });
            document.getElementById("all-none-check-reader-id").innerText = 'CHECK ALL'
        }
    })
}

// CREATE READER ARRAY ======================================================== 
export function readerArray(){
    let obj = []
    const allP = document.getElementById("hidden-div-reader-id").querySelectorAll('p');
    allP.forEach(p => {
        if(p.querySelector('input') && p.querySelector('input').checked == true){
            obj.push(p.querySelector('input').value)
        }
                
    });
    return obj
}


// BACK TO MAIN PAGE 
export function backToMain(){
    document.getElementById('task-quit-btn-id').addEventListener('click', function(){
        window.location.href = `${serverUrl}/tasks/main-task`
    })

}

export function pageLoad(){
    window.onload = function() {
        // button'sm titles 
        document.getElementById('task-btn-origins-id').textContent = "NONE"
        document.getElementById('task-btn-status-id').textContent = 'DRAFT'
        document.getElementById('task-btn-editable-id').textContent = 'LOCKED'
        document.getElementById('task-btn-visibility-id').textContent = 'NO VISIBLE'
        document.getElementById('task-btn-reader-id').textContent = 'NO READER'

        // default checkbox input  
        document.getElementById('origin-none-id').innerText = 'NONE'
        
        // default radio input
        document.getElementById('origins-0').checked = true
        document.getElementById("skatch-status").checked = true
        const allEditable = document.getElementById("hidden-div-editable-id").querySelectorAll('p');
        allEditable.forEach(p => {
            if(p.querySelector('input')){
                p.querySelector('input').checked = false
            }
            
        });
        const allVisibility = document.getElementById("hidden-div-visibility-id").querySelectorAll('p');
        allVisibility.forEach(p => {
            if(p.querySelector('input')){
                p.querySelector('input').checked = false
            }
            
        });
        const allReader = document.getElementById("hidden-div-reader-id").querySelectorAll('p');
        allReader.forEach(p => {
            if(p.querySelector('input')){
                p.querySelector('input').checked = false
            }
            
        });
        

        
        

    };
}

