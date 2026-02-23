import { serverUrl, getGlobalProfile } from "./config.js";

document.addEventListener('DOMContentLoaded', function () {
    // CALL USERS PAGE ================================================
    document.getElementById("setting-btn-user").addEventListener('click', function(){
        window.location.href = `${serverUrl}/users/user-page`
        
    })


    if(getGlobalProfile() == 'author'){
        // CALL LEADER PAGE ================================================
            document.getElementById("setting-btn-leader").addEventListener('click', function(){
                window.location.href = `${serverUrl}/users/leader-page`
            })

            
            function createLoadingComponent(info) {
                const container = document.createElement('div');
                container.classList.add('loading-container');

                const spinner = document.createElement('div');
                spinner.classList.add('spinner');

                const text = document.createElement('div');
                text.classList.add('loading-text');
                text.textContent = info;

                container.append(spinner, text);
                return container;
            }
        
            function backButton(popupBack, divPaiButton){
                divPaiButton.replaceChildren()
                const btnBack = document.createElement('button');
                btnBack.textContent = 'BACK';
                btnBack.classList.add('btn-back-stt');
                btnBack.addEventListener('click', () => {
                    popupBack.style.display = 'none';

                });
                divPaiButton.append(btnBack)
                return btnBack
            } 

            

            function confirmButton(divPaiButton, popupTitle,btnBack, qrDiv, userId){
                const btnConfirm = document.createElement('button');
                btnConfirm.id = 'connect-whatsapp' 
                btnConfirm.textContent = 'CONNECT' 
                btnConfirm.classList.add('btn-confirm-stt');

                btnConfirm.addEventListener('click', async() => {
                    divPaiButton.replaceChildren()
                    const loading = createLoadingComponent('Generating QR Code...');
                    divPaiButton.appendChild(loading);
                    popupTitle.textContent = "CONECTING WHATSAPP"
                    btnConfirm.style.color = 'white' 
                    try {
                        const res = await fetch(`${serverUrl}/whatsapp/connect`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ user_id: userId })
                        });
                        const data = await res.json();
                        const userIdReturned = data.user_id; // do fetch /whatsapp/connect
                        popupTitle.textContent = "GENERATING QR CODE"
                        const evtSource = new EventSource(`${serverUrl}/whatsapp/stream?user_id=${userIdReturned}`);
                        evtSource.onmessage = function(event) {
                            console.log(event)
                            // qrDiv.replaceChildren()
                            // loading.remove()
                            // btnBack.remove()
                            // popupTitle.textContent = "PLEASE SCAN THE QR CODE FORM YOUR MOBILE DEVICE"
                            // divPaiButton.replaceChildren()
                            // const img = document.createElement('img');
                            // img.src = event.data;
                            // img.style.width = '250px';
                            // img.alt = 'QR Code WhatsApp';
                            // qrDiv.append(img)
                            // Displays Buttons: 'Back' and 'Cancel'
                            // divPaiButton.append(btnBack)
                            // const btnCancel = document.createElement('button')
                            // btnCancel.id = 'cancel-whatsapp'
                            // btnCancel.textContent = "CANCEL" 
                            // btnCancel.classList.add('btn-confirm-stt');
                            // btnCancel.addEventListener('click',async()=> {
                            //     evtSource.close(); 
                            //     try {
                            //         const response = await fetch(`${serverUrl}/whatsapp/disconnect?user_id=${userId}`);
                            //         const status = await response.json();
                            //         if(status.status == 'disconnected'){
                            //             popupTitle.textContent = "WHATSAPP DISCONNECTED"
                            //             qrDiv.replaceChildren()
                            //             btnCancel.remove()
                            //             // divPaiButton.appendChild(btnConfirm)
                            //         }
                            //     }catch (err) {
                            //         console.error('Erro no fetch:', err);
                            //     }
                            // });
                            // divPaiButton.append(btnCancel)
                        }
                    } catch (err) {
                        console.error('Erro no fetch:', err);
                    }
                    // const evtSource = new EventSource(`${serverUrl}/whatsapp/stream`);
                    // evtSource.onmessage = function(event) {
                    //     divPaiButton.replaceChildren()
                    // }
                     
                });
               
                divPaiButton.append(btnConfirm)
            } 

            function connectedSteps(){
                console.log('conectados')
            }

            function disconnectedSteps(divPaiButton, popupTitle, btnBack, qrDiv, userId){
                // console.log('desconectados')
                popupTitle.textContent = "PLEASE MAKE SURE THAT GOOGLE CHROME IS INSTALLED AND UP TO DATE BEFORE ATTEMPTING TO CONNECT MAGIMAGI COP TO WHATSAPP"
                confirmButton(divPaiButton, popupTitle, btnBack, qrDiv, userId)
            }

            function restartService(btnRestart, qrDiv,popupTitle, userId){
                btnRestart.addEventListener('click', async () => {
                    console.log('started')
                    qrDiv.replaceChildren()
                    const loading = createLoadingComponent('Removing user...')
                    qrDiv.replaceChildren(loading)
                    popupTitle.textContent = 'RESTARTING WHATSAPP SERVICE'
                    try {
                            const res = await fetch(`${serverUrl}/whatsapp/disconnect?user_id=${userId}`);
                            const data = await res.json();
                            console.log('Disconnect data:', data);

                            if (data.status === 'disconnected') {
                                popupTitle.textContent = "WHATSAPP DISCONNECTED";

                                const loadingStep = createLoadingComponent('Restarting Node.js...');
                                qrDiv.replaceChildren(loadingStep);

                                try {
                                    const res = await fetch(`${serverUrl}/whatsapp/restart-node`, { method: 'POST' });
                                    const data = await res.json();
                                    console.log(data)
                                    if (data.message === 'Node server restarted/started') {
                                        qrDiv.replaceChildren();
                                        popupTitle.textContent = 'WHATSAPP SERVICE RESTARTED';
                                    }else{
                                        console.log(data)
                                    }
                                } catch (err) {
                                    console.error('Error restarting Node:', err);
                                    alert('Failed to restart Node');
                                }
                            }
                        
                    } catch (err) {
                            console.error('Fetch error:', err);
                    }
                });
            }

            function restartButton(qrDiv, popupTitle, userId){
                const btnRestartService = document.createElement('button')
                btnRestartService.textContent = 'Start/Restart WhatsApp Service'
                btnRestartService.style.padding = '4px';
                const divRestart = document.createElement('div')
                divRestart.id = 'restart-id'
                restartService(btnRestartService, qrDiv, popupTitle, userId)
                divRestart.append(btnRestartService)
                const divPopupIdChild = document.getElementById('popup-id')
                divPopupIdChild.append(divRestart)
            }

            document.getElementById("setting-btn-whatsapp").addEventListener('click', async () => {
                // It displays main popup div 
                    const popupBack = document.getElementById("popup-id-back");
                    popupBack.style.display = 'block'

                // Clean restart-id button form popup div if it exists.
                    const divPopupId = document.getElementById('popup-id').children
                    Array.from(divPopupId).forEach(item => {
                        if(item.id === 'restart-id'){
                            item.remove()
                        }
                    })
                    
                        
                // Main title
                    const popupTitleLabel = document.getElementById('popup-title-label');
                    popupTitleLabel.textContent = "Welcome to Magimagi WhatsApp Integration."
                    popupTitleLabel.style.backgroundColor = '#a3ada7ff';
                    popupTitleLabel.style.fontWeight = 'bold';
                    popupTitleLabel.style.padding = '10px';
                    popupTitleLabel.style.borderRadius = '8px';

                // Subtitle
                    const popupTitle = document.getElementById('popup-title');

                //  Buttons div
                    const divPaiButton = document.getElementById('div-btn-stt')
                    divPaiButton.replaceChildren()
                
                // Qr code div
                    const qrDiv = document.getElementById('qr-code-id')
                    qrDiv.replaceChildren()
                
                // Build back button function + Append it to button div
                    const btnBack = backButton(popupBack, divPaiButton)
    
                // Verify if exists whatsapp user
                    const userId = document.getElementById('whatsapp-user-id').value;
                    const response = await fetch(`${serverUrl}/whatsapp/status?user_id=${userId}`);
                    const status = await response.json();
                    if(status.nodeserver == 'off'){
                        popupTitle.textContent = "PLEASE START OR RESTART WHATSAPP SERVICE"
                        
                    }else{
                        console.log('coisado')
                        console.log(status)
                    }
                    restartButton(qrDiv, popupTitle, userId)
                // console.log(status)
                // if(status.connected){
                //     connectedSteps()
                // }else{
                //     disconnectedSteps(divPaiButton, popupTitle, btnBack, qrDiv, userId)
                // }
                
                // const btnRestartService = document.createElement('button')
                // btnRestartService.textContent = 'Start/Restart WhatsApp Service'
                // btnRestartService.style.padding = '4px';
                // const divRestart = document.createElement('div')
                // divRestart.id = 'restart-id'
                // restartService(btnRestartService, qrDiv, popupTitle, userId)
                // divRestart.append(btnRestartService)
                // const divPopupIdChild = document.getElementById('popup-id')
                // divPopupIdChild.append(divRestart)
            });


    }
              
    document.getElementById("setting-btn-doc").addEventListener('click', function(){
            window.location.href = `${serverUrl}/doc/doc-page`
        })
    // CALL MAIN PAGE ================================================
    document.getElementById("setting-btn-desktop").addEventListener('click', function(){
        window.location.href = `${serverUrl}/tasks/main-task`
    })

})
