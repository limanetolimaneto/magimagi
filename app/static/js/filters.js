import { serverUrl, getGlobalProfile } from "./config.js";

// RESTORE CHECKBOXES WHEN THE PAGE IS LOADED =============================================
export function onLoadPageFunction(){
    // RULE ==> FILTER AUTHOR/COAUTHOR
    if(getGlobalProfile() == 'coauthor'){
        // DIHE DIV LEGENDS    
            document.getElementById("legend-btn-skatch-id").style.display = 'none'
            document.getElementById("legend-btn-solved-id").style.display = 'none'
            document.getElementById("legend-btn-canceled-id").style.display = 'none'
            
        // BUTTON BACK == QUIT UPDATE SCREEN
            const btnBack = document.getElementById("copage-update-btnback-id")
            btnBack.addEventListener('click', function () {
                document.getElementById("copage-update-nest-back-id").style.display = 'none'
                document.getElementById("copage-update-ipttop").value = ""
                document.getElementById("copage-update-textarea-id").value = ""
            })  
        // BUTTON CONFIRM == UPDATE TASK ==> COMMENTS FIELD
            const btnConfirm = document.getElementById("copage-update-btnconfirm-id")
            btnConfirm.addEventListener('click', async ()  => {
                // document.getElementById("copage-update-ipttop").value = ""
                // document.getElementById("copage-update-textarea-id").value = ""
                // document.getElementById("copage-update-nest-back-id").style.display = 'none'
                const updatedObject = {
                    'id' : document.getElementById("copage-update-ipttop").value,
                    'comments' : document.getElementById("copage-update-textarea-id").value
                }
                const response = await fetch(`${serverUrl}/tasks/update`,{
                                    method : 'PUT',
                                    headers:{"User-Agent": "Mozilla/5.0",
                                        "Accept": "application/json",
                                        "Content-Type": "application/json"},
                                    credentials: "include",
                                    body: JSON.stringify(updatedObject)
                                })
                const resp = await response.json()
                document.getElementById('popup-id-back').style.display = 'block'
                document.getElementById('popup-title-label').textContent = resp.title == 'ok'? 'SUCCESS' : 'ERROR'
                document.getElementById('popup-title').textContent = resp.content
                const btnDone = document.createElement('button')
                btnDone.textContent = 'OK'
                btnDone.classList.add('btn-back-stt')
                btnDone.style.width = '100%'
                btnDone.addEventListener('click',function () {
                    window.location.href = `${serverUrl}/tasks/main-task`
                })
                document.getElementById("div-btn-stt").append(btnDone)
            })
        // ITERATE TASKS FOR IMPLEMENTING UPDATE FUNCTIONS
            const taskNodeList = document.getElementsByName("task-update-btn-name")
            taskNodeList.forEach(item => {
                const updateBtn = item
                updateBtn.addEventListener('click', function () {
                    document.getElementById("copage-update-nest-back-id").style.display = 'block'
                    document.getElementById("copage-update-ipttop").value = this.value 
                })
            })
    }
    let range = document.getElementById("filter-daterange-input-id")
    let deadline = document.getElementById("filter-deadline-input-id")
    let origin = document.getElementById("filter-origin-input-id")
    let editable = document.getElementById("filter-editable-input-id")
    if(range){range.checked = false}
    if(deadline){deadline.checked = false}
    if(origin){origin.checked = false}
    if(editable){editable.checked = false}
    
    const statusElement = document.getElementById("filter-status-id")
    statusElement.value = "";
        
    const originElement = document.getElementById("filter-origin-select-id")
    originElement.value = ""

    const editableElement = document.getElementById("filter-editable-select-id")
    editableElement.value = ""

    const dateFromElement = document.getElementById("filter-daterange-from-input-id")
    dateFromElement.value = ""

    const dateToElement = document.getElementById("filter-daterange-to-input-id")
    dateToElement.value = ""

    const deadlineElement = document.getElementById("filter-deadline-until-input-id")
    deadlineElement.value = ""

}

// SHOW HIDDEN DIVS WHEN THE CHECKBOX IS CHECKED ==========================================
export function filterCheckbox(){
    document.getElementById('filter-daterange-input-id').addEventListener('click', function(event){
        if(event.target.checked){
            document.getElementById("filter-daterange-div-id").style.display = "block"
        }else{
            document.getElementById("filter-daterange-div-id").style.display = "none"
        }

    })
    document.getElementById('filter-deadline-input-id').addEventListener('click', function(event){
        if(event.target.checked){
            document.getElementById("filter-deadline-div-id").style.display = "block"
        }else{
            document.getElementById("filter-deadline-div-id").style.display = "none"
        }

    })
    document.getElementById('filter-origin-input-id').addEventListener('click', function(event){
        if(event.target.checked){
            document.getElementById("filter-origin-div-id").style.display = "block"
        }else{
            document.getElementById("filter-origin-div-id").style.display = "none"
        }

    })
    document.getElementById('filter-editable-input-id').addEventListener('click', function(event){
        if(event.target.checked){
            document.getElementById("filter-editable-div-id").style.display = "block"
        }else{
            document.getElementById("filter-editable-div-id").style.display = "none"
        }

    })

}

// FORMAT THE OBJECT FILTERS ==============================================================
    function formatFilters(){
        const filters = {
            'status':'',
            'origin_date_from':'',
            'origin_date_to':'',
            'deadline':'',
            'origin_id':'',
            'editable':''
        }
        filters.status = document.getElementById("filter-status-id").value
        filters.origin_date_from = document.getElementById("filter-daterange-from-input-id").value
        filters.origin_date_to = document.getElementById("filter-daterange-to-input-id").value    
        filters.deadline =  document.getElementById("filter-deadline-until-input-id").value
        filters.origin_id = document.getElementById("filter-origin-select-id").value
        filters.editable = document.getElementById("filter-editable-select-id").value
        return filters
        
    }

// REQUEST FILTERED TASKS =================================================================
export function filterBtnFunction(){
    document.getElementById('filter-btn-id').addEventListener('click', function(){
        const filters = formatFilters()
        window.location.href = `${serverUrl}/tasks/main-task?filters=${JSON.stringify(filters)}`
        console.log(filters)
    })

}


// ========================================================================================================= 
// ===== READERS =========================================================================================== 
    // TASK UPDATE 3 - ADD REMOVE READERS FUNCTION ==================================================  
    // DISPLAYS DIV add__class-add-remove-id-back ==========================================================
    function addRemoveReaders(readers,idTask,color) {
        // VERIFY BUTTON PARAMS ==> true = 'USERS' / false = 'NO USERS'
        var trueColordivListAddRemove3 = ''
        var trueColorarrayChecked3 = ''
        if(color){
            // FORMAT STRING ['1','2','3']_['name1','name2','name3'] TO THE OBJECTS =>   idJson   AND   nameJson 
                const params = document.getElementById(`set_${idTask}_readerIdName`).value
                const paramsFull = params.split('_')
                const paramsIdStr =  paramsFull[0].replace(/'/g,'"')
                const idJson = JSON.parse(paramsIdStr)                      // idJson    
                const paramsNameStr =  paramsFull[1].replace(/'/g,'"')
                const nameJson = JSON.parse(paramsNameStr)                  // nameJson
            // GET THE HTML COLLECTION OF THE DIV task-update-div-display-align-line-bottom-reader
                trueColordivListAddRemove3 = document.getElementById('task-update-div-display-align-line-bottom-reader')
        }
        // DISPLAYS DIV FOR LISTING THE CHECKBOXES AND LABELS = add__class-add-remove-id-back
            document.getElementById('add__class-add-remove-id-back').style.display = 'block'
        
        // CREATE AND APPEND THE BUTTONS BACK AND CONFIRM
            const divPai = document.getElementById('add__class-add-remove-id')
            const btnReaderNo = document.createElement('button')
            btnReaderNo.id = 'btn_id_No'
            btnReaderNo.textContent = 'BACK'
            const btnReaderYes = document.createElement('button')
            btnReaderYes.id = 'btn_id_Yes'
            btnReaderYes.textContent = 'CONFIRM'
        if(color){
            // APPENDING ONLY THE CHECKED CHECKBOXES
                // ITERATE HTML COLLECTION OF THE DIV task-update-div-display-align-line-bottom-reader
                trueColorarrayChecked3 = []
                Array.from(trueColordivListAddRemove3.children).forEach(element => {
                    // IF INPUT -- id="set_{{t.id}}_readerName" -- HAS ANY VALUE ==> STRING == "['name1','name2']"
                    if(element.id){
                        // CREATE A DIV 
                            const divNest = document.createElement('div')
                            divNest.style.display = 'flex'
                            var idReady = element.id.split('__')[1]
                            const iptNew = document.createElement('input')
                            iptNew.setAttribute('type', 'checkbox');
                            iptNew.value = idReady
                            iptNew.checked = true
                        // APPEND CHECKBOX
                            divNest.append(iptNew)
                            const labelNew = document.createElement('label')
                            labelNew.textContent = element.textContent.toUpperCase()
                            labelNew.style.marginLeft = '4px'
                        // APPEND LABEL 
                            divNest.append(labelNew)
                            divPai.append(divNest)
                        // KEEP THE READERS ID CHECKED IN THE ARRAY == arrayChecked
                            trueColorarrayChecked3.push(idReady)
                    }
                })
        }

        // APPENDING THE UNCHECKED CHECKBOXES
        if(color){
            readers.forEach(item=>{
                if(!trueColorarrayChecked3.includes(String(item.id))){
                    const divNest = document.createElement('div')
                    divNest.style.display = 'flex'
                    const iptNew = document.createElement('input')
                    iptNew.setAttribute('type', 'checkbox');
                    iptNew.value = item.id
                    iptNew.checked = false
                    divNest.append(iptNew)
                    const labelNew = document.createElement('label')
                    labelNew.textContent = item.description.toUpperCase()
                    labelNew.style.marginLeft = '4px'
                    divNest.append(labelNew)
                    divPai.append(divNest)
                }
            })
        }else{
            readers.forEach(item=>{
                const divNest = document.createElement('div')
                divNest.style.display = 'flex'
                const iptNew = document.createElement('input')
                iptNew.setAttribute('type', 'checkbox');
                iptNew.value = item.id
                iptNew.checked = false
                divNest.append(iptNew)
                const labelNew = document.createElement('label')
                labelNew.textContent = item.description.toUpperCase()
                labelNew.style.marginLeft = '4px'
                divNest.append(labelNew)
                divPai.append(divNest)
            })
        }
        // CREATE NEST
            const divYesNo = document.createElement('div')
            divYesNo.classList.add('class-btn-yes-no')
        // CREATE 'BACK' FUNCTION 
            btnReaderNo.addEventListener('click',function () {
                // EMPTY NEST DIV ==> ! AVOID DUPLICATE ELEMENTS IN CASE OPEN AGAIN  
                    document.getElementById('add__class-add-remove-id').replaceChildren()
                // HIDE NEST DIV
                    document.getElementById('add__class-add-remove-id-back').style.display = 'none'
            })
        // CREATE 'CONFIRM' FUNCTION     
            btnReaderYes.addEventListener('click',function () {
                const editReaders = document.getElementsByClassName('add__class-add-remove')
                const fixedIds = document.getElementById('task-update-div-display-align-line-bottom-reader').children
                // CLEAN THE DIV 2
                    Array.from(fixedIds).forEach((val,key) => {
                        if(key>1){
                            val.remove()
                        }
                    })
                // ITERATE HTML COLLECTIO OF THE CURRENT DIV NEST FOR CHECKING THE CHECKED CHECKBOXES 
                    // UPDATE THE DIV 2 WITH THE LABELS OF THE CHECKED READERS
                        var count = 0
                        var stringArrayId = ""
                        var stringArrayName = ""
                        Array.from(editReaders[0].children).forEach((element) => {
                            if(element.children[0].checked){
                                const lbReader = document.createElement('label')
                                lbReader.textContent = element.children[1].textContent.toUpperCase()
                                lbReader.id = `add__${element.children[0].value}`
                                document.getElementById('task-update-div-display-align-line-bottom-reader').append(lbReader)
                                stringArrayId += (count == 0) ? `'${element.children[0].value}'` : `,'${element.children[0].value}'`
                                stringArrayName += (count == 0) ? `'${element.children[1].textContent}'` : `,'${element.children[1].textContent}'`
                                count += 1
                            }
                            
                        })
                        
                        // UPDATE THE MAIN DIV WITH THE STRINGS 
                            var stringArrayId_ = (stringArrayId !== "")? `[${stringArrayId}]`:""
                            var stringArrayName_ = (stringArrayName !== "")? `[${stringArrayName}]`:""
                            var stringArrayIdName_ = (stringArrayId !== "")? `[${stringArrayId_}]_[${stringArrayName_}]`:"" 
                            document.getElementById(`set_${idTask}_readerId`).value = stringArrayId_
                            document.getElementById(`set_${idTask}_readerName`).value = stringArrayName_
                            document.getElementById(`set_${idTask}_readerIdName`).value = stringArrayIdName_
                            

                        // IF THERE IS NO CHECKED READER ==> UPDATE LABEL = 'UNAVAILABLE TO READERS' AND BUTTON = 'ENABLE TASK TO READERS' 
                            if(stringArrayId == ""){
                                const fatherDiv2 = document.getElementById('task-update-div-display-align-line-bottom-reader').children
                                fatherDiv2[0].textContent = 'UNAVAILABLE TO READERS'
                                fatherDiv2[0].style.color = 'black'
                                fatherDiv2[1].textContent = 'ENABLE TASK TO READERS'
                                fatherDiv2[1].style.backgroundColor = 'black'

                            }else{
                                const fatherDiv2 = document.getElementById('task-update-div-display-align-line-bottom-reader').children
                                fatherDiv2[0].textContent = 'AVAILABLE TO READERS'
                                fatherDiv2[0].style.color = 'GREEN'
                                fatherDiv2[1].textContent = 'ADD / REMOVE READERS'
                                fatherDiv2[1].style.backgroundColor = 'green'
                            }

                // CLEAN AND HIDE THE DIV 3
                    document.getElementById('add__class-add-remove-id').replaceChildren()
                    document.getElementById('add__class-add-remove-id-back').style.display = 'none'
            })
        // APPEND 
            divYesNo.append(btnReaderNo)
            divYesNo.append(btnReaderYes)
            divPai.append(divYesNo)
    }

    // TASK UPDATE 2 - FORMAT READERS FUNCTION =============================================================
    // CREATE ELEMENTS TO LIST USERS ON  task-update-div-display-align-line-bottom-reader ==================
    function formatReader(elementPai3,elementPaiId3,readers,idTask){
        // DIV 2 ======================================================================================
        const divReader = document.getElementById('task-update-div-display-align-line-bottom-reader')
            // LABEL "AVAILABLE TO READERS"
                const labelReader = document.createElement('label')
                labelReader.style.fontWeight = 'bold'
            // BUTTON "ADD / REMOVE READERS"
                const buttonReader = document.createElement('button')
                buttonReader.style.borderRadius = '6px'
                
        // DIV 2 =======================================================================================
        
        // CHECK IF THERES IS READER
        if(elementPai3 == "" || elementPai3=='[]' ){
            // LABEL UNAVAILABLE TO READERS
                labelReader.textContent = "UNAVAILABLE TO READERS"
                labelReader.style.color = "black"
                divReader.append(labelReader)
            // BUTTON ENABLE TO READERS
                buttonReader.textContent = " ENABLE TASK TO READERS "
                buttonReader.style.backgroundColor = 'black'
                buttonReader.style.color = 'lightgray'
                buttonReader.addEventListener('click', function () {
                    addRemoveReaders(readers,idTask,false)  
                })
                divReader.append(buttonReader)
        }else{
            // LABEL "AVAILABLE TO READERS"
                labelReader.textContent = "AVAILABLE TO READERS"
                labelReader.style.color = "darkgreen"
                divReader.append(labelReader)
            // BUTTON "ADD / REMOVE"
                buttonReader.textContent = "ADD / REMOVE READERS"
                buttonReader.style.backgroundColor = 'darkgreen'
                buttonReader.style.color = 'lightgray'
                buttonReader.addEventListener('click', function () {
                    addRemoveReaders(readers,idTask,true)  
                })
                divReader.append(buttonReader)
            // LIST READERS NAMES 
                const contentReaderId = elementPaiId3.replace(/'/g,'"')
                const contentReaderIdJson = JSON.parse(contentReaderId)
                const contentReaderName = elementPai3.replace(/'/g,'"')
                const contentReaderNameJson = JSON.parse(contentReaderName)
                contentReaderNameJson.forEach((element,index) => {
                    const labelName = document.createElement('label')
                    labelName.id = `add__${contentReaderIdJson[index]}`
                    labelName.textContent = element.toUpperCase()
                    divReader.append(labelName)
                });         
        }
    }

// ===== READERS =========================================================================================== 
// ========================================================================================================= 

// ========================================================================================================= 
// ===== VISIBLE USERS ==================================================================================== 
    // TASK UPDATE 3 - ADD REMOVE VISIBILITY USERS FUNCTION ================================================  
    // DISPLAYS DIV add__class-add-remove-id-back ==========================================================
    function addRemoveVisibility(users,idTask,color) {
        // VERIFY BUTTON PARAMS ==> true = 'USERS' / false = 'NO USERS'
        var trueColordivListAddRemove = ''
        var trueColorarrayChecked = ''
        if(color){
            // FORMAT STRING ['1','2','3']_['name1','name2','name3'] TO THE OBJECTS =>   idJson   AND   nameJson 
                const params = document.getElementById(`set_${idTask}_visibilityIdName`).value
                const paramsFull = params.split('_')
                const paramsIdStr =  paramsFull[0].replace(/'/g,'"')
                const idJson = JSON.parse(paramsIdStr)                      // idJson    
                const paramsNameStr =  paramsFull[1].replace(/'/g,'"')
                const nameJson = JSON.parse(paramsNameStr)                  // nameJson
            // GET THE HTML COLLECTION OF THE DIV task-update-div-display-align-line-bottom-visibility
                trueColordivListAddRemove = document.getElementById('task-update-div-display-align-line-bottom-visibility')
        }
        // DISPLAYS DIV FOR LISTING THE CHECKBOXES AND LABELS = add__class-add-remove-id-back
            document.getElementById('add__class-add-remove-id-back').style.display = 'block'
        
        // CREATE AND APPEND THE BUTTONS BACK AND CONFIRM
            const divPai = document.getElementById('add__class-add-remove-id')
            const btnVisibilityNo = document.createElement('button')
            btnVisibilityNo.id = 'btn_id_No'
            btnVisibilityNo.textContent = 'BACK'
            const btnVisibilityYes = document.createElement('button')
            btnVisibilityYes.id = 'btn_id_Yes'
            btnVisibilityYes.textContent = 'CONFIRM'
        
        if(color){
            // APPENDING ONLY THE CHECKED CHECKBOXES
                // ITERATE HTML COLLECTION OF THE DIV task-update-div-display-align-line-bottom-visibility
                trueColorarrayChecked = []
                Array.from(trueColordivListAddRemove.children).forEach(element => {
                    // IF INPUT -- id="set_{{t.id}}_visibilityName" -- HAS ANY VALUE ==> STRING == "['name1','name2']"
                    if(element.id){
                        // CREATE A DIV 
                            const divNest = document.createElement('div')
                            divNest.style.display = 'flex'
                            var idReady = element.id.split('__')[1]
                            const iptNew = document.createElement('input')
                            iptNew.setAttribute('type', 'checkbox');
                            iptNew.value = idReady
                            iptNew.checked = true
                        // APPEND CHECKBOX
                            divNest.append(iptNew)
                            const labelNew = document.createElement('label')
                            labelNew.textContent = element.textContent.toUpperCase()
                            labelNew.style.marginLeft = '4px'
                        // APPEND LABEL 
                            divNest.append(labelNew)
                            divPai.append(divNest)
                        // KEEP THE USERS ID CHECKED IN THE ARRAY == arrayChecked
                            trueColorarrayChecked.push(idReady)
                    }
                })
        }

        // APPENDING THE UNCHECKED CHECKBOXES
        if(color){
            users.forEach(item=>{
                if(item.profile == 'author'){
                    if(!trueColorarrayChecked.includes(String(item.id))){
                        const divNest = document.createElement('div')
                        divNest.style.display = 'flex'
                        const iptNew = document.createElement('input')
                        iptNew.setAttribute('type', 'checkbox');
                        iptNew.value = item.id
                        iptNew.checked = false
                        divNest.append(iptNew)
                        const labelNew = document.createElement('label')
                        labelNew.textContent = item.name.toUpperCase()
                        labelNew.style.marginLeft = '4px'
                        divNest.append(labelNew)
                        divPai.append(divNest)
                    }
                }
            })
        }else{
            users.forEach(item=>{
                if(item.profile == 'author'){
                    const divNest = document.createElement('div')
                    divNest.style.display = 'flex'
                    const iptNew = document.createElement('input')
                    iptNew.setAttribute('type', 'checkbox');
                    iptNew.value = item.id
                    iptNew.checked = false
                    divNest.append(iptNew)
                    const labelNew = document.createElement('label')
                    labelNew.textContent = item.name.toUpperCase()
                    labelNew.style.marginLeft = '4px'
                    divNest.append(labelNew)
                    divPai.append(divNest)
                }
            })
        }
        // CREATE NEST
            const divYesNo = document.createElement('div')
            divYesNo.classList.add('class-btn-yes-no')
        // CREATE 'BACK' FUNCTION 
            btnVisibilityNo.addEventListener('click',function () {
                // EMPTY NEST DIV ==> ! AVOID DUPLICATE ELEMENTS IN CASE OPEN AGAIN  
                    document.getElementById('add__class-add-remove-id').replaceChildren()
                // HIDE NEST DIV
                    document.getElementById('add__class-add-remove-id-back').style.display = 'none'
            })
        // CREATE 'CONFIRM' FUNCTION     
            btnVisibilityYes.addEventListener('click',function () {
                const visibleUsers = document.getElementsByClassName('add__class-add-remove')
                const fixedIds = document.getElementById('task-update-div-display-align-line-bottom-visibility').children
                // CLEAN THE DIV 2
                    Array.from(fixedIds).forEach((val,key) => {
                        if(key>1){
                            val.remove()
                        }
                    })
                // ITERATE HTML COLLECTION OF THE CURRENT DIV NEST FOR CHECKING THE CHECKED CHECKBOXES 
                    // UPDATE THE DIV 2 WITH THE LABELS OF THE CHECKED VISIBLE USERS
                        var count = 0
                        var stringArrayId = ""
                        var stringArrayName = ""
                        Array.from(visibleUsers[0].children).forEach((element) => {
                            if(element.children[0].checked){
                                const lbVisibility = document.createElement('label')
                                lbVisibility.textContent = element.children[1].textContent.toUpperCase()
                                lbVisibility.id = `add__${element.children[0].value}`
                                document.getElementById('task-update-div-display-align-line-bottom-visibility').append(lbVisibility)
                                stringArrayId += (count == 0) ? `'${element.children[0].value}'` : `,'${element.children[0].value}'`
                                stringArrayName += (count == 0) ? `'${element.children[1].textContent}'` : `,'${element.children[1].textContent}'`
                                count += 1
                            }
                            
                        })
                        
                        // UPDATE THE MAIN DIV WITH THE STRINGS 
                            var stringArrayId_ = (stringArrayId !== "")? `[${stringArrayId}]`:""
                            var stringArrayName_ = (stringArrayName !== "")? `[${stringArrayName}]`:""
                            var stringArrayIdName_ = (stringArrayId !== "")? `[${stringArrayId_}]_[${stringArrayName_}]`:"" 
                            document.getElementById(`set_${idTask}_visibilityId`).value = stringArrayId_
                            document.getElementById(`set_${idTask}_visibilityName`).value = stringArrayName_
                            document.getElementById(`set_${idTask}_visibilityIdName`).value = stringArrayIdName_
                            
                        // IF THERE IS NO CHECKED VISIBLE USER ==> UPDATE LABEL = 'PRIVATE' AND BUTTON = 'MAKE IT VISIBLE' 
                            if(stringArrayId == ""){
                                const fatherDiv2 = document.getElementById('task-update-div-display-align-line-bottom-visibility').children
                                fatherDiv2[0].textContent = 'PRIVATE'
                                fatherDiv2[0].style.color = 'black'
                                fatherDiv2[1].textContent = 'MAKE IT VISIBLE'
                                fatherDiv2[1].style.backgroundColor = 'black'
                            }else{
                                const fatherDiv2 = document.getElementById('task-update-div-display-align-line-bottom-visibility').children
                                fatherDiv2[0].textContent = 'VISIBLE'
                                fatherDiv2[0].style.color = 'GREEN'
                                fatherDiv2[1].textContent = 'ADD / REMOVE USERS'
                                fatherDiv2[1].style.backgroundColor = 'green'
                            }

                // CLEAN AND HIDE THE DIV 3
                    document.getElementById('add__class-add-remove-id').replaceChildren()
                    document.getElementById('add__class-add-remove-id-back').style.display = 'none'
            })
        // APPEND 
            divYesNo.append(btnVisibilityNo)
            divYesNo.append(btnVisibilityYes)
            divPai.append(divYesNo)
    }

    // TASK UPDATE 2 - FORMAT VISIBILITY FUNCTION ==========================================================
    // CREATE ELEMENTS TO LIST USERS ON  task-update-div-display-align-line-bottom-visibility ==============
    function formatVisibility(elementPai2,elementPaiId2,users,idTask){
        // DIV 2 ======================================================================================
        const divVisibility = document.getElementById('task-update-div-display-align-line-bottom-visibility')
            // LABEL "VISIBLE"
                const labelVisibility = document.createElement('label')
                labelVisibility.style.fontWeight = 'bold'
            // BUTTON "ADD/REMOVE USERS"
                const buttonVisible = document.createElement('button')
                buttonVisible.style.borderRadius = '6px'
        // DIV 2 =======================================================================================
        
        // CHECK IF THERES IS VISIBILITY USER
        if(elementPai2 == "" || elementPai2=='[]' ){
            // LABEL PRIVATE
                labelVisibility.textContent = "PRIVATE"
                labelVisibility.style.color = "black"
                divVisibility.append(labelVisibility)
            // BUTTON UNLOCK
                buttonVisible.textContent = " UNLOCK "
                buttonVisible.style.backgroundColor = 'black'
                buttonVisible.style.color = 'lightgray'
                buttonVisible.addEventListener('click', function () {
                    addRemoveVisibility(users,idTask,false)  
                })
                divVisibility.append(buttonVisible)
        }else{
            // LABEL "VISIBILITY"
                labelVisibility.textContent = "VISIBLE"
                labelVisibility.style.color = "darkgreen"
                divVisibility.append(labelVisibility)
            // BUTTON "ADD / REMOVE"
                buttonVisible.textContent = "ADD / REMOVE USERS"
                buttonVisible.style.backgroundColor = 'darkgreen'
                buttonVisible.style.color = 'lightgray'
                buttonVisible.addEventListener('click', function () {
                    addRemoveVisibility(users,idTask,true)  
                })
                divVisibility.append(buttonVisible)
            // LIST VISIBLE USER NAMES 
                const contentVisibilityId = elementPaiId2.replace(/'/g,'"')
                const contentVisibilityIdJson = JSON.parse(contentVisibilityId)
                const contentVisibilityName = elementPai2.replace(/'/g,'"')
                const contentVisibilityNameJson = JSON.parse(contentVisibilityName)
                contentVisibilityNameJson.forEach((element,index) => {
                    const labelName = document.createElement('label')
                    labelName.id = `add__${contentVisibilityIdJson[index]}`
                    labelName.textContent = element.toUpperCase()
                    divVisibility.append(labelName)
                });  
        }
    }

// ===== VISIBLE USERS ==================================================================================== 
// ========================================================================================================= 


// ========================================================================================================= 
// ===== EDITABLE USERS ==================================================================================== 
    // TASK UPDATE 3 - ADD REMOVE EDITABLE USERS FUNCTION ==================================================  
    // DISPLAYS DIV add__class-add-remove-id-back ==========================================================
    function addRemoveEditables(users,idTask,color) {
        // VERIFY BUTTON PARAMS ==> true = 'USERS' / false = 'NO USERS'
        var trueColordivListAddRemove = ''
        var trueColorarrayChecked = ''
        if(color){
            // FORMAT STRING ['1','2','3']_['name1','name2','name3'] TO THE OBJECTS =>   idJson   AND   nameJson 
                const params = document.getElementById(`set_${idTask}_editableIdName`).value
                const paramsFull = params.split('_')
                const paramsIdStr =  paramsFull[0].replace(/'/g,'"')
                const idJson = JSON.parse(paramsIdStr)                      // idJson    
                const paramsNameStr =  paramsFull[1].replace(/'/g,'"')
                const nameJson = JSON.parse(paramsNameStr)                  // nameJson
        
            // GET THE HTML COLLECTION OF THE DIV task-update-div-display-align-line-bottom-editable
                trueColordivListAddRemove = document.getElementById('task-update-div-display-align-line-bottom-editable')
        }
        // DISPLAYS DIV FOR LISTING THE CHECKBOXES AND LABELS = add__class-add-remove-id-back
            document.getElementById('add__class-add-remove-id-back').style.display = 'block'
        
        // CREATE AND APPEND THE BUTTONS BACK AND CONFIRM
            const divPai = document.getElementById('add__class-add-remove-id')
            const btnEditableNo = document.createElement('button')
            btnEditableNo.id = 'btn_id_No'
            btnEditableNo.textContent = 'BACK'
            const btnEditableYes = document.createElement('button')
            btnEditableYes.id = 'btn_id_Yes'
            btnEditableYes.textContent = 'CONFIRM'

        if(color){
            // APPENDING ONLY THE CHECKED CHECKBOXES
                // ITERATE HTML COLLECTION OF THE DIV task-update-div-display-align-line-bottom-editable
                trueColorarrayChecked = []
                Array.from(trueColordivListAddRemove.children).forEach(element => {
                    // IF INPUT -- id="set_{{t.id}}_editableName" -- HAS ANY VALUE ==> STRING == "['name1','name2']"
                    if(element.id){
                        // CREATE A DIV 
                            const divNest = document.createElement('div')
                            divNest.style.display = 'flex'
                            var idReady = element.id.split('__')[1]
                            const iptNew = document.createElement('input')
                            iptNew.setAttribute('type', 'checkbox');
                            iptNew.value = idReady
                            iptNew.checked = true
                        // APPEND CHECKBOX
                            divNest.append(iptNew)
                            const labelNew = document.createElement('label')
                            labelNew.textContent = element.textContent.toUpperCase()
                            labelNew.style.marginLeft = '4px'
                        // APPEND LABEL 
                            divNest.append(labelNew)
                            divPai.append(divNest)
                        // KEEP THE USERS ID CHECKED IN THE ARRAY == trueColorarrayChecked
                            trueColorarrayChecked.push(idReady)
                    }
                })
        }

        // APPENDING THE UNCHECKED CHECKBOXES 
        if(color){
            users.forEach(item=>{
                if(item.profile == 'author'){
                    if(!trueColorarrayChecked.includes(String(item.id))){
                        const divNest = document.createElement('div')
                        divNest.style.display = 'flex'
                        const iptNew = document.createElement('input')
                        iptNew.setAttribute('type', 'checkbox');
                        iptNew.value = item.id
                        iptNew.checked = false
                        divNest.append(iptNew)
                        const labelNew = document.createElement('label')
                        labelNew.textContent = item.name.toUpperCase()
                        labelNew.style.marginLeft = '4px'
                        divNest.append(labelNew)
                        divPai.append(divNest)
                    }
                }
            })
        }else{
            users.forEach(item=>{
                if(item.profile == 'author'){
                    const divNest = document.createElement('div')
                    divNest.style.display = 'flex'
                    const iptNew = document.createElement('input')
                    iptNew.setAttribute('type', 'checkbox');
                    iptNew.value = item.id
                    iptNew.checked = false
                    divNest.append(iptNew)
                    const labelNew = document.createElement('label')
                    labelNew.textContent = item.name.toUpperCase()
                    labelNew.style.marginLeft = '4px'
                    divNest.append(labelNew)
                    divPai.append(divNest)
                }
            })
        }
        // CREATE NEST
            const divYesNo = document.createElement('div')
            divYesNo.classList.add('class-btn-yes-no')
        // CREATE 'BACK' FUNCTION 
            btnEditableNo.addEventListener('click',function () {
                // EMPTY NEST DIV ==> ! AVOID DUPLICATE ELEMENTS IN CASE OPEN AGAIN  
                    document.getElementById('add__class-add-remove-id').replaceChildren()
                // HIDE NEST DIV
                    document.getElementById('add__class-add-remove-id-back').style.display = 'none'
            })
        // CREATE 'CONFIRM' FUNCTION     
            btnEditableYes.addEventListener('click',function () {
                const editUsers = document.getElementsByClassName('add__class-add-remove')
                const fixedIds = document.getElementById('task-update-div-display-align-line-bottom-editable').children
                // CLEAN THE DIV 2
                    Array.from(fixedIds).forEach((val,key) => {
                        if(key>1){
                            val.remove()
                        }
                    })
                // ITERATE HTML COLLECTION OF THE CURRENT DIV NEST FOR CHECKING THE CHECKED CHECKBOXES 
                    // UPDATE THE DIV 2 WITH THE LABELS OF THE CHECKED EDITABLE USERS
                        var count = 0
                        var stringArrayId = ""
                        var stringArrayName = ""
                        Array.from(editUsers[0].children).forEach((element) => {
                            if(element.children[0].checked){
                                const lbEdit = document.createElement('label')
                                lbEdit.textContent = element.children[1].textContent.toUpperCase()
                                lbEdit.id = `add__${element.children[0].value}`
                                document.getElementById('task-update-div-display-align-line-bottom-editable').append(lbEdit)
                                stringArrayId += (count == 0) ? `'${element.children[0].value}'` : `,'${element.children[0].value}'`
                                stringArrayName += (count == 0) ? `'${element.children[1].textContent}'` : `,'${element.children[1].textContent}'`
                                count += 1
                            }
                            
                        })
                        
                        // UPDATE THE MAIN DIV WITH THE STRINGS 
                            var stringArrayId_ = (stringArrayId !== "")? `[${stringArrayId}]`:""
                            var stringArrayName_ = (stringArrayName !== "")? `[${stringArrayName}]`:""
                            var stringArrayIdName_ = (stringArrayId !== "")? `[${stringArrayId_}]_[${stringArrayName_}]`:"" 
                            document.getElementById(`set_${idTask}_editableId`).value = stringArrayId_
                            document.getElementById(`set_${idTask}_editableName`).value = stringArrayName_
                            document.getElementById(`set_${idTask}_editableIdName`).value = stringArrayIdName_

                        // IF THERE IS NO CHECKED EDITABLE USER ==> UPDATE LABEL = 'LOCKED' AND BUTTON = 'UNLOCK' 
                            if(stringArrayId == ""){
                                const fatherDiv2 = document.getElementById('task-update-div-display-align-line-bottom-editable').children
                                fatherDiv2[0].textContent = 'LOCKED'
                                fatherDiv2[0].style.color = 'black'
                                fatherDiv2[1].textContent = 'UNLOCK'
                                fatherDiv2[1].style.backgroundColor = 'black'
                            }else{
                                const fatherDiv2 = document.getElementById('task-update-div-display-align-line-bottom-editable').children
                                fatherDiv2[0].textContent = 'EDITABLE'
                                fatherDiv2[0].style.color = 'GREEN'
                                fatherDiv2[1].textContent = 'ADD / REMOVE USERS'
                                fatherDiv2[1].style.backgroundColor = 'green'
                            }

                // CLEAN AND HIDE THE DIV 3
                    document.getElementById('add__class-add-remove-id').replaceChildren()
                    document.getElementById('add__class-add-remove-id-back').style.display = 'none'
            })
        // APPEND 
            divYesNo.append(btnEditableNo)
            divYesNo.append(btnEditableYes)
            divPai.append(divYesNo)
    }

    // TASK UPDATE 2 - FORMAT EDITABLE FUNCTION ============================================================
    // CREATE ELEMENTS TO LIST USERS ON  task-update-div-display-align-line-bottom-editable ================
    function formatEditable(elementPai,elementPaiId,users,idTask){
        // DIV 2 ======================================================================================
        const divEditable = document.getElementById('task-update-div-display-align-line-bottom-editable')
            // LABEL "EDITABLE"
                const labelEditable = document.createElement('label')
                labelEditable.style.fontWeight = 'bold'
            // BUTTON "UNLOCK / ADD/REMOVE"
                const buttonEditable = document.createElement('button')
                buttonEditable.style.borderRadius = '6px'
        // DIV 2 =======================================================================================
        
        // CHECK IF THERES IS EDITABLE USER
        if(elementPai == "" || elementPai=='[]' ){
            // LABEL LOCKED
                labelEditable.textContent = "LOCKED"
                labelEditable.style.color = "black"
                divEditable.append(labelEditable)
            // BUTTON UNLOCK
                buttonEditable.textContent = " UNLOCK "
                buttonEditable.style.backgroundColor = 'black'
                buttonEditable.style.color = 'lightgray'
                buttonEditable.addEventListener('click', function () {
                    addRemoveEditables(users,idTask,false)  
                })
                divEditable.append(buttonEditable)
        }else{
            // LABEL "EDITABLE"
                labelEditable.textContent = "EDITABLE"
                labelEditable.style.color = "darkgreen"
                divEditable.append(labelEditable)
            // BUTTON "ADD / REMOVE"
                buttonEditable.textContent = "ADD / REMOVE USERS"
                buttonEditable.style.backgroundColor = 'darkgreen'
                buttonEditable.style.color = 'lightgray'
                buttonEditable.addEventListener('click', function () {
                    addRemoveEditables(users,idTask,true)  
                })
                divEditable.append(buttonEditable)
            // LIST EDITABLE USER NAMES 
                const contentEditableId = elementPaiId.replace(/'/g,'"')
                const contentEditableIdJson = JSON.parse(contentEditableId)
                const contentEditableName = elementPai.replace(/'/g,'"')
                const contentEditableNameJson = JSON.parse(contentEditableName)
                contentEditableNameJson.forEach((element,index) => {
                    const labelName = document.createElement('label')
                    labelName.id = `add__${contentEditableIdJson[index]}`
                    labelName.textContent = element.toUpperCase()
                    divEditable.append(labelName)
                });         
            
        }
    }

// ===== EDITABLE USERS ================================================================================ 
// ===================================================================================================== 


// ===================================================================================================== 
// ===== COAUTHOR ====================================================================================== 
    // TASK UPDATE 3 - ADD REMOVE COAUTHORS FUNCTION ===================================================  
    // DISPLAYS DIV add__class-add-remove-id-back ======================================================
    function addRemoveCoauthors(allCo,idTask,existCo) {
        // GET CURRENT ID COAUTHORS 
        const currentIdDisplayed = document.getElementById(`hidden-set_${idTask}_coauthor`).value
        const currentId = currentIdDisplayed.replace(/'/g,'"')
        const currentIdJson = JSON.parse(currentId)
        // SHOW THE HIDDEN DIV 3 AND CLEAN THE NEST DIV  
        document.getElementById('add__class-add-remove-id-back').style.display = 'block'
        const divNestCo = document.getElementById('add__class-add-remove-id')
        divNestCo.replaceChildren()
        // ITERATE ALL COAUTHORS FOR CHECKING TASK COAUTHORS
        Array.from(allCo).forEach(item => {
            // CREATE A DIV LINE
            const divLine = document.createElement('div')
            divLine.classList.add("co-items-div-line")
            // CHECK IF THE TASK HAS COAUTHOR
            if(existCo){
                // CREATE UPDATE DIV CHECKED`S CHILDREN
                const inputCo = document.createElement('input')
                inputCo.setAttribute('type','checkbox')
                inputCo.value = item.id
                inputCo.checked = (currentIdJson.includes(item.id))? true : false
                const labelCo = document.createElement('label')
                labelCo.textContent = item.name   
                divLine.append(inputCo)
                divLine.append(labelCo)
            }else{
                const inputCo = document.createElement('input')
                inputCo.setAttribute('type','checkbox')
                inputCo.value = item.id
                inputCo.checked = false
                const labelCo = document.createElement('label')
                labelCo.textContent = item.name  
                divLine.append(inputCo)
                divLine.append(labelCo)         
            }
            divNestCo.append(divLine)
        })
        // CREATE BACK BUTTON
        const btnBack = document.createElement('button')
        btnBack.textContent = 'BACK'
        btnBack.id = 'btn_id_No'
            //  BACK FUNCTION 
            btnBack.addEventListener('click',function () {
                document.getElementById('add__class-add-remove-id-back').style.display = 'none'
            })
        // CREATE CONFIRM BUTTON
        const btnConfirm = document.createElement('button')
        btnConfirm.textContent = 'CONFIRM'
        btnConfirm.id = 'btn_id_Yes'
            // CONFIRM FUNCTION
            btnConfirm.addEventListener('click', function () {
                // CLEAN DIV 2 
                const fatherDivCo = document.getElementById('task-update-div-display-coauthor')
                fatherDivCo.replaceChildren()
                fatherDivCo.classList.add('father-div-co')
                // ITERATE COLLECTION OF THE DIV NEST FOR CHECKING CHECKED CHECKBOX
                const nestChildren = document.getElementById('add__class-add-remove-id').children
                var strIdCo = ''
                var strNameCo = ''
                var countCo = 0
                Array.from(nestChildren).forEach(item =>{
                    if(item.children[0].getAttribute('type') == "checkbox"){
                        if(item.children[0].checked==true){
                            strIdCo += (countCo==0)? `${item.children[0].value}` : `,${item.children[0].value}`
                            strNameCo += (countCo==0)? `'${item.children[1].textContent}'` : `,'${item.children[1].textContent}'`
                            // UPDATE LABELS OF THE DIV 2 
                            const lbDiv2 = document.createElement('label')
                            lbDiv2.textContent = item.children[1].textContent
                            lbDiv2.id = `co-id__${item.children[0].value}`
                            fatherDivCo.append(lbDiv2)
                        }
                    }
                    countCo += 1
                })
                if(strIdCo === ''){
                    strIdCo = "[0]"
                    strNameCo = "[None]"
                    const lbDiv2 = document.createElement('label')
                    lbDiv2.textContent = "ADD COAUTHOR"
                    fatherDivCo.append(lbDiv2)
                    document.getElementById(`hidden-set_${idTask}_coauthor`).value = strIdCo
                    document.getElementById(`hidden-set_${idTask}_coauthor_name`).value = strNameCo
                }else{
                    document.getElementById(`hidden-set_${idTask}_coauthor`).value = `[${strIdCo}]`
                    document.getElementById(`hidden-set_${idTask}_coauthor_name`).value = `[${strNameCo}]`
                }
                // EMPTY NEST DIV ==> ! AVOID DUPLICATE ELEMENTS IN CASE OPEN AGAIN  
                document.getElementById('add__class-add-remove-id').replaceChildren()
                // HIDE NEST DIV
                document.getElementById('add__class-add-remove-id-back').style.display = 'none'
            })
        // APPEND BUTTON DIV TO DIV NEST   
        const divLine = document.createElement('div')
        divLine.classList.add("class-btn-yes-no")     
        divLine.append(btnBack)
        divLine.append(btnConfirm)
        divNestCo.append(divLine)
       
    }

    // TASK UPDATE 2 - FORMAT COAUTHORS ================================================================
    function formatCo(currentId, currentName,allCo,idTask) {
        // FATHER DIV == UPDATE DIV == DIV 2
            const fatherDivCo = document.getElementById('task-update-div-display-coauthor')
            fatherDivCo.replaceChildren()
            fatherDivCo.classList.add('father-div-co')
            var existCo = false
        // ITERATE TASK COAUTHORS
            if(currentId !== "[0]"){
                const idsCo = JSON.parse(currentId)
                const currentName_ = currentName.replace(/'/g,'"')
                const namesCo = JSON.parse(currentName_)
                idsCo.forEach((element,index )=> {
                    const lbCo = document.createElement('label')
                    lbCo.textContent = namesCo[index]
                    lbCo.id = `co-id__${element}`
                    fatherDivCo.append(lbCo)
                })
                existCo = true
            }else{
                // CREATE LABEL ADD COAUTHOR
                const lbCo = document.createElement('label')
                lbCo.textContent = 'ADD COAUTHOR'
                fatherDivCo.append(lbCo)
                existCo = false
            }
            // CREATE FUNCTION FOR ADD / REMOVE COAUTHOR
                fatherDivCo.addEventListener('click', function () {
                    addRemoveCoauthors(allCo,idTask,existCo)
                })
    }

// ===== COAUTHOR ====================================================================================== 
// ===================================================================================================== 


// ======================================================================================
// TASK UPDATE 1   ======================================================================
// CALLS FUNCTIONS                formatEditable(), formatVisibility() AND formatReader()
// DISPLAYS DIV                                              task-update-div-display-back 
    // VAR FIRSTVALUE KEEP ORIGINAL VALUES FROM DIV 1 ==> ! TO BE USED FOR THE BACK BUTTON 
    var firstValues = []
    var firstValuesCo = []
    export function taskUpdate(){
        if(getGlobalProfile() == 'author'){
            const btns = document.getElementsByName("task-update-btn-name");
            
            const allUsersValue = document.getElementById('all-users-object').value
            const allUsersStr1 = allUsersValue.replace(/'/g,'"')
            const allUsersStr2 = allUsersStr1.replace(/None/g,'""')
            const allUsersJson = JSON.parse(allUsersStr2)

            const allReadersValue = document.getElementById('all-readers-object').value
            const allReadersStr1 = allReadersValue.replace(/'/g,'"')
            const allReadersStr2 = allReadersStr1.replace(/None/g,'""')
            const allReadersJson = JSON.parse(allReadersStr2)
            
            const allCoauthorsValue = document.getElementById('all-coauthors-object').value
            const allCoauthorsStr1 = allCoauthorsValue.replace(/'/g,'"')
            const allCoauthorsStr2 = allCoauthorsStr1.replace(/None/g,'""')
            const allCoauthorsJson = JSON.parse(allCoauthorsStr2)

            btns.forEach(btn => {
                btn.addEventListener('click', function() {
                    const idTask = this.value;
                    document.getElementsByClassName('task-update-div-display-back')[0].style.display = 'block'

                    firstValues = [
                        idTask, 
                        (document.getElementById(`set_${idTask}_editableId`).value) ? document.getElementById(`set_${idTask}_editableId`).value : '', 
                        (document.getElementById(`set_${idTask}_editableName`).value) ? document.getElementById(`set_${idTask}_editableName`).value : '', 
                        (document.getElementById(`set_${idTask}_editableIdName`).value) ? document.getElementById(`set_${idTask}_editableIdName`).value : '',
                        (document.getElementById(`set_${idTask}_visibilityId`).value) ? document.getElementById(`set_${idTask}_visibilityId`).value : '', 
                        (document.getElementById(`set_${idTask}_visibilityName`).value) ? document.getElementById(`set_${idTask}_visibilityName`).value : '', 
                        (document.getElementById(`set_${idTask}_visibilityIdName`).value) ? document.getElementById(`set_${idTask}_visibilityIdName`).value : '',
                        (document.getElementById(`set_${idTask}_readerId`).value) ? document.getElementById(`set_${idTask}_readerId`).value : '', 
                        (document.getElementById(`set_${idTask}_readerName`).value) ? document.getElementById(`set_${idTask}_readerName`).value : '', 
                        (document.getElementById(`set_${idTask}_readerIdName`).value) ? document.getElementById(`set_${idTask}_readerIdName`).value : '',
                    ]

                    firstValuesCo = [
                        idTask,
                        document.getElementById(`hidden-set_${idTask}_coauthor`).value,
                        document.getElementById(`hidden-set_${idTask}_coauthor_name`).value
                    ]

                    document.getElementById('form-update-id-id').value = document.getElementById(`set_${idTask}_id`).textContent
                    // Modificando formato de data para formato magimagi_date
                    // ACCORDING TO ISO 8601 ==> input date format.
                    let dateStr = document.getElementById(`set_${idTask}_date`).textContent
                    let parts = dateStr.split('/');
                    let formatted = `${parts[2]}-${parts[1]}-${parts[0]}`; 
                    document.getElementById('form-update-date-id').value = formatted
                    document.getElementById('form-update-time-id').value = document.getElementById(`set_${idTask}_time`).textContent
                    let deadlineStr = document.getElementById(`set_${idTask}_deadline`).textContent
                    let deadlineParts = deadlineStr.split('/');
                    let deadlineFormatted = `${parts[2]}-${parts[1]}-${parts[0]}`; 
                    document.getElementById('form-update-deadline-id').value = deadlineFormatted
                    document.getElementById('select-update-origin-id').value = (document.getElementById(`hidden-set_${idTask}_origin`).value!=='None')?
                    document.getElementById(`hidden-set_${idTask}_origin`).value : '0'
                    document.getElementById('form-update-description-id').value = document.getElementById(`set_${idTask}_description`).textContent
                    document.getElementById('form-update-instructions-id').value = document.getElementById(`set_${idTask}_instructions`).textContent

                    formatEditable( document.getElementById(`set_${idTask}_editableName`).value, 
                                    document.getElementById(`set_${idTask}_editableId`).value, 
                                    allUsersJson, idTask 
                                )

                    formatVisibility(   document.getElementById(`set_${idTask}_visibilityName`).value,
                                        document.getElementById(`set_${idTask}_visibilityId`).value, 
                                        allUsersJson, idTask 
                                    )

                    formatReader(   document.getElementById(`set_${idTask}_readerName`).value,
                                    document.getElementById(`set_${idTask}_readerId`).value, 
                                    allReadersJson, idTask 
                                )

                    formatCo(   document.getElementById(`hidden-set_${idTask}_coauthor`).value,
                                document.getElementById(`hidden-set_${idTask}_coauthor_name`).value,
                                allCoauthorsJson, idTask
                            )
                
                });
            });
        
        }
    }
// TASK UPDATE 1   ======================================================================
// ======================================================================================

// ======================================================================================
// FORM UPDATE CONFIRM BUTTON LISTENER FUNCTION =========================================
    export function updateConfirm(){
        if(getGlobalProfile()=='author'){
            document.getElementById('btn-update-confirm-id').addEventListener('click', async() => {
                const idSave = document.getElementById('form-update-id-id').value
                const date = document.getElementById('form-update-date-id').value
                const time = document.getElementById('form-update-time-id').value
                const deadline = document.getElementById('form-update-deadline-id').value
                const origin = document.getElementById('select-update-origin-id').value
                const description = document.getElementById('form-update-description-id').value
                const instructions = document.getElementById('form-update-instructions-id').value
                const comments = document.getElementById('form-update-comments-id').value
                
                // IT GETS THE CHILDREN OF DIV 2 ==> ID == add__x
                    const childrenEdit = document.getElementById('task-update-div-display-align-line-bottom-editable').children
                    const childrenVisible = document.getElementById('task-update-div-display-align-line-bottom-visibility').children
                    const childrenReader = document.getElementById('task-update-div-display-align-line-bottom-reader').children
                    const arrayEditable = []
                    const arrayVisibility = []
                    const arrayReader = []
                    Array.from(childrenEdit).forEach(element => {
                        if(element.id){
                            var editIdChosen = element.id.split("__")[1]
                            arrayEditable.push(editIdChosen)
                        }
                    })
                    Array.from(childrenVisible).forEach(element => {
                        if(element.id){
                            var visibleIdChosen = element.id.split("__")[1]
                            arrayVisibility.push(visibleIdChosen)
                        }
                    })

                    Array.from(childrenReader).forEach(element => {
                        if(element.id){
                            var readerIdChosen = element.id.split("__")[1]
                            arrayReader.push(readerIdChosen)
                        }
                    })

                    const childrenCoauthor = document.getElementById('task-update-div-display-coauthor').children
                    const arrayCoauthor = []
                    Array.from(childrenCoauthor).forEach(element => {
                        if(element.id){
                            var coauthorIdChosen = element.id.split("__")[1]
                            arrayCoauthor.push(Number(coauthorIdChosen))
                        }
                    })
                const updatedObject = {
                    'id' : idSave,
                    'origin_date' : date,
                    'origin_time' : time,
                    'deadline' : deadline,
                    'origin_id' : origin,
                    'description' : description,
                    'instructions' : instructions,
                    'comments' : comments,
                    'editable' : arrayEditable,
                    'visibility': arrayVisibility,
                    'reader': arrayReader,
                    'coauthor' : arrayCoauthor
                }
                const response = await fetch(`${serverUrl}/tasks/update`,{
                    method : 'PUT',
                    headers:{"User-Agent": "Mozilla/5.0",
                            "Accept": "application/json",
                            "Content-Type": "application/json"},
                    credentials: "include",
                    body: JSON.stringify(updatedObject)
                })
                const resp = await response.json()
                document.getElementById('popup-id-back').style.display = 'block'
                document.getElementById('popup-title-label').textContent = resp.title == 'ok'? 'SUCCESS' : 'ERROR'
                document.getElementById('popup-title').textContent = resp.content
                const btnDone = document.createElement('button')
                btnDone.textContent = 'OK'
                btnDone.classList.add('btn-back-stt')
                btnDone.style.width = '100%'
                btnDone.addEventListener('click',function () {
                    firstValues.length = 0
                    arrayEditable.length = 0
                    arrayVisibility.length = 0
                    arrayReader.length = 0
                    firstValuesCo.length = 0
                    arrayCoauthor.lenght = 0
                    window.location.href = `${serverUrl}/tasks/main-task`
                })
                document.getElementById('div-btn-stt').appendChild(btnDone)
                
            })
        }
    }
// FORM UPDATE CONFIRM BUTTON LISTENER FUNCTION =========================================
// ======================================================================================

// ======================================================================================
// FORM UPDATE CANCEL BUTTON LISTENER FUNCTION
    export function updateCancel(){
        if(getGlobalProfile()=='author'){
            document.getElementById('btn-update-cancel-id').addEventListener('click', function(){
                const taskId = this.value
                document.getElementsByClassName('task-update-div-display-back')[0].style.display = 'none'
                document.getElementById('form-update-id-id').value = ""
                document.getElementById('form-update-date-id').value = ""
                document.getElementById('form-update-time-id').value = ""
                document.getElementById('form-update-deadline-id').value = ""
                document.getElementById('select-update-origin-id').value = "0"
                document.getElementById('form-update-description-id').value = ""
                document.getElementById('form-update-instructions-id').value = ""
                document.getElementById('form-update-comments-id').value = ""
                document.getElementById('task-update-div-display-align-line-bottom-editable').replaceChildren();
                document.getElementById('task-update-div-display-align-line-bottom-visibility').replaceChildren();
                document.getElementById('task-update-div-display-align-line-bottom-reader').replaceChildren();
                // RESTORE DIV 1 = EDITABLE - VISIBILITY - READERS
                    document.getElementById(`set_${firstValues[0]}_editableId`).value = firstValues[1]
                    document.getElementById(`set_${firstValues[0]}_editableName`).value = firstValues[2]
                    document.getElementById(`set_${firstValues[0]}_editableIdName`).value = firstValues[3]

                    document.getElementById(`set_${firstValues[0]}_visibilityId`).value = firstValues[4]
                    document.getElementById(`set_${firstValues[0]}_visibilityName`).value = firstValues[5]
                    document.getElementById(`set_${firstValues[0]}_visibilityIdName`).value = firstValues[6]

                    document.getElementById(`set_${firstValues[0]}_readerId`).value = firstValues[7]
                    document.getElementById(`set_${firstValues[0]}_readerName`).value = firstValues[8]
                    document.getElementById(`set_${firstValues[0]}_readerIdName`).value = firstValues[9]
                    
                    firstValues.length = 0
                
                // RESTORE DIV 1 = EDITABLE - VISIBILITY - READERS
                    document.getElementById(`hidden-set_${firstValuesCo[0]}_coauthor`).value = firstValuesCo[1]
                    document.getElementById(`hidden-set_${firstValuesCo[0]}_coauthor_name`).value = firstValuesCo[2]
                    
                    firstValuesCo.length = 0
            })
        }
    }
// FORM UPDATE CANCEL BUTTON LISTENER FUNCTION
// ======================================================================================


// ==========================================================================================
// OPEN CLOSE FUNCTIONS =====================================================================
    // BUTTON = OPEN/CLOSE ALL TASKS ========================================================
        export function openCloseAllTasks(){
            document.getElementById("open-all-tasks-btn-id").addEventListener('click',function () {
                const allShorts = document.getElementsByClassName("short-task-div-class")
                Array.from(allShorts).forEach(item => {
                    item.style.display = 'none'
                })
                const allFulls = document.getElementsByClassName("full-task-div-class")
                Array.from(allFulls).forEach(item => {
                    item.style.display = 'block'
                })
                this.style.display = 'none'
                document.getElementById("close-all-tasks-btn-id").style.display = 'block'
            })
            document.getElementById("close-all-tasks-btn-id").addEventListener('click',function () {
                const allShorts = document.getElementsByClassName("short-task-div-class")
                Array.from(allShorts).forEach(item => {
                    item.style.display = 'block'
                })
                const allFulls = document.getElementsByClassName("full-task-div-class")
                Array.from(allFulls).forEach(item => {
                    item.style.display = 'none'
                })
                this.style.display = 'none'
                document.getElementById("open-all-tasks-btn-id").style.display = 'block'
            })
        }

    // BUTTON = OPEN/CLOSE BY STATUS ========================================================
        export function openCloseByStatus(){
            document.getElementById("btn-hide-show-stt-skatch-id").addEventListener('click',function () {
                const td = document.getElementsByClassName('display-class-td')
                Array.from(td).forEach(item => {
                    var status = item.id.split("_")[1]
                    if(status == 'draft'){
                        item.style.display = (this.textContent == 'HIDE')? 'none':'block' 
                    }
                })
                this.textContent = (this.textContent=='HIDE')?'SHOW':'HIDE'
            })
            document.getElementById("btn-hide-show-stt-started-id").addEventListener('click',function () {
                const td = document.getElementsByClassName('display-class-td')
                Array.from(td).forEach(item => {
                    var status = item.id.split("_")[1]
                    if(status == 'in progress'){
                        item.style.display = (this.textContent == 'HIDE')? 'none':'block' 
                    }
                })
                this.textContent = (this.textContent=='HIDE')?'SHOW':'HIDE'
            })
            document.getElementById("btn-hide-show-stt-responded-id").addEventListener('click',function () {
                const td = document.getElementsByClassName('display-class-td')
                Array.from(td).forEach(item => {
                    var status = item.id.split("_")[1]
                    if(status == 'responded'){
                        item.style.display = (this.textContent == 'HIDE')? 'none':'block' 
                    }
                })
                this.textContent = (this.textContent=='HIDE')?'SHOW':'HIDE'
            })
            document.getElementById("btn-hide-show-stt-standingby-id").addEventListener('click',function () {
                const td = document.getElementsByClassName('display-class-td')
                Array.from(td).forEach(item => {
                    var status = item.id.split("_")[1]
                    if(status == 'standing by'){
                        item.style.display = (this.textContent == 'HIDE')? 'none':'block' 
                    }
                })
                this.textContent = (this.textContent=='HIDE')?'SHOW':'HIDE'
            })
            document.getElementById("btn-hide-show-stt-solved-id").addEventListener('click',function () {
                const td = document.getElementsByClassName('display-class-td')
                Array.from(td).forEach(item => {
                    var status = item.id.split("_")[1]
                    if(status == 'completed'){
                        item.style.display = (this.textContent == 'HIDE')? 'none':'block' 
                    }
                })
                this.textContent = (this.textContent=='HIDE')?'SHOW':'HIDE'
            })
            document.getElementById("btn-hide-show-stt-canceled-id").addEventListener('click',function () {
                const td = document.getElementsByClassName('display-class-td')
                Array.from(td).forEach(item => {
                    var status = item.id.split("_")[1]
                    if(status == 'canceled'){
                        item.style.display = (this.textContent == 'HIDE')? 'none':'block' 
                    }
                })
                this.textContent = (this.textContent=='HIDE')?'SHOW':'HIDE'
            })
        
        }

// OPEN CLOSE FUNCTIONS =====================================================================
// ==========================================================================================


// ==========================================================================================
// REDIRECT TO THE SETTINGS PAGE PAGE =======================================================
    export function settingsPage(){
        document.getElementById('settings-new-btn-id').addEventListener('click', function () {
            window.location.href = `${serverUrl}/leader/settings-page`
        })
    }

// ==========================================================================================
// REDIRECT TO THE NEW ORIGIN PAGE ==========================================================
export function newOrigin(){
    document.getElementById('origin-new-btn-id').addEventListener('click', function () {
        window.location.href = `${serverUrl}/origins/new-origin-page`
    })
}

// ==========================================================================================
// REDIRECT TO THE NEW READER PAGE ==========================================================
export function newReader(){
    document.getElementById('reader-new-btn-id').addEventListener('click', function(){
        window.location.href = `${serverUrl}/readers/readers-page`
    })
}





// DISPLAY UPDATE STATUS DIV  =============================================================================  
// V2 => STATUS == solved -> comnpleted 
const statusArray = ['draft','in progress','responded','standing by','completed','canceled']
function bgColorFunction(item,element){
    switch (item) {
        case 'draft':
            element.style.backgroundColor = '#7e8520'
            break;
        case 'in progress':
            element.style.backgroundColor = '#538154'
            break;
        case 'responded':
            element.style.backgroundColor = '#9e6b29'
            break;
        case 'standing by':
            element.style.backgroundColor = '#7591ac'
            break;
        case 'completed':
            element.style.backgroundColor = '#229422'
            break;
        case 'canceled':
            element.style.backgroundColor = '#8a4040'
            break;
        default:
            break;
    }    
}
                                 
function updateStatusRequest(id, status){
    const divPopup = document.getElementById('popup-id-back')
    divPopup.style.display = 'block'
    document.getElementById('popup-title-label').textContent = 'ATTENTION'
    if(status=='responded'){
        const warningMessage = 'RESPONDED STATUS IS AVILABLE ONLY FOR CO-AUTHOR PROFILE'
        document.getElementById('popup-title').textContent = warningMessage
        const divNestStt = document.getElementById('div-btn-stt')
        const btnBack = document.createElement('button')
        btnBack.textContent = "BACK"
        btnBack.classList.add("btn-back-stt")
        divNestStt.append(btnBack)
        btnBack.addEventListener('click', function () {
            divNestStt.replaceChildren()
            divPopup.style.display = 'none'
        })
        return;
    }
    const warningMessage = `CONFIRM TO UPDATE THE STATUS OF THE TASK ID = ${id} AS ${status.toUpperCase()}`
    document.getElementById('popup-title').textContent = warningMessage
    const divNestStt = document.getElementById('div-btn-stt')
    const btnBack = document.createElement('button')
    btnBack.textContent = "BACK"
    btnBack.classList.add("btn-back-stt")
    btnBack.addEventListener('click', function () {
        divNestStt.replaceChildren()
        divPopup.style.display = 'none'
    })
    divNestStt.append(btnBack)
    const btnConfirm = document.createElement('button')
    btnConfirm.textContent = 'CONFIRM'
    btnConfirm.classList.add("btn-confirm-stt")
    btnConfirm.addEventListener('click',async()=> {
        const updatedObject = {
            'id' : id,
            'status' : status
        }
        const response = await fetch(`${serverUrl}/tasks/update`,{
            method:'PUT',
            headers:{"User-Agent": "Mozilla/5.0",
                "Accept": "application/json",
                "Content-Type": "application/json"},
            credentials: "include",
            body: JSON.stringify(updatedObject)
            })
            const resp = await response.json()
            divNestStt.replaceChildren()
            if(resp.title && resp.title == 'ok'){
                document.getElementById('task-update-status-div-id').replaceChildren()
                document.getElementById('task-update-status-div-back-id').style.display = 'none'
                document.getElementById('popup-title-label').textContent =  'SUCCESS'
                const messageResp = `THE STATUS OF THE TASK ${resp.description.toUpperCase()} WAS UPDATED TO ${status.toUpperCase()}`
                document.getElementById('popup-title').textContent = messageResp
                const btnBack = document.createElement('button')
                btnBack.innerText = 'OK'
                btnBack.classList.add("popup-button-class")
                btnBack.style.width = '100%'
                divNestStt.append(btnBack)
                btnBack.addEventListener('click',function () {
                    divPopup.style.display = 'none'
                    divNestStt.replaceChildren()
                    location.reload()
                })
                
            }else{

            }
        })
            
            divNestStt.append(btnConfirm)
    }

export function updateStatus(){
    const collectionStatus = document.getElementsByClassName("display-status")
    Array.from(collectionStatus).forEach(element => {
        const labelItem = element.getElementsByTagName("label")[0]
        labelItem.addEventListener('click', function(){
            const divNestBack = document.getElementById("task-update-status-div-back-id")
            divNestBack.style.display = 'block'
            const divNest = document.getElementById('task-update-status-div-id')
            const currentStatusButton = document.createElement('button')
            currentStatusButton.textContent = labelItem.textContent
            currentStatusButton.classList.add("btn-status-din-class")
            currentStatusButton.style.color = "#386d41"
            currentStatusButton.style.fontWeight = "bolder"
            currentStatusButton.addEventListener('click', function () {
                divNestBack.style.display = 'none'
                divNest.replaceChildren()
            })
            divNest.append(currentStatusButton)
            statusArray.forEach(item => {
                if(item !== labelItem.textContent){
                    const btn = document.createElement('button')
                    btn.textContent = item
                    btn.classList.add("btn-status-din-class")
                    bgColorFunction(item,btn)
                    divNest.append(btn)  
                    btn.addEventListener('click', function () {
                        const taskIdStr = labelItem.getAttribute('id')
                        const taskId = taskIdStr.split("_")
                        const teste = updateStatusRequest(taskId[1], item)
                    })  
                }
            });
        })
    })
}


// SHORT FULL DISPLAY FUNCION =====================================================================
export function showHideDiv() {
    const blockDisplayDivs = document.getElementsByName('short-task-div')
    Array.from(blockDisplayDivs).forEach(element => {
        const idStr = element.getAttribute('id')
        const idReady = idStr.split('_')[1]
        element.addEventListener('click',function () {
            document.getElementById(`short-task-div-id_${idReady}`).style.display = 'none'  
            document.getElementById(`full-task-div-id_${idReady}`).style.display = 'block'   
        })
    })
    const closeBtn =  document.getElementsByClassName('full-hide-btn')
    Array.from(closeBtn).forEach(element => {
        const id = element.value
        element.addEventListener('click',function () {
            document.getElementById(`short-task-div-id_${id}`).style.display = 'block'  
            document.getElementById(`full-task-div-id_${id}`).style.display = 'none'   
        })
    })
}
