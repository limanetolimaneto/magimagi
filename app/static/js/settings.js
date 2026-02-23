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

            // ================================================================
            // WHATSAPP SERVICES ==============================================
                
                // == CONST ==
                    const userId = document.getElementById('whatsapp-user-id').value 
                    const webWhatsappButton = document.getElementById('setting-btn-whatsapp')
                    const popupBackDiv = document.getElementById('popup-id-back')
                    const popupFrontDiv = document.getElementById('popup-id')
                    const qrCode_loadingDiv = document.getElementById('qr-code-id')
                    const title = document.getElementById('popup-title-label')
                    const subTitle = document.getElementById('popup-title')
                    const divButtons = document.getElementById('div-btn-stt')

                // == Loading function ==
                    function loadingDiv(info){
                        qrCode_loadingDiv.replaceChildren()
                        const container = document.createElement('div');
                        container.classList.add('loading-container');
                        const spinner = document.createElement('div');
                        spinner.classList.add('spinner');
                        const text = document.createElement('div');
                        text.classList.add('loading-text');
                        text.textContent = info;
                        container.append(spinner, text);
                        qrCode_loadingDiv.appendChild(container);
                    }

                // == Back Button ==
                    function backButton(){
                        divButtons.replaceChildren()
                        const backButton = document.createElement('button')
                        backButton.textContent = 'BACK';
                        backButton.classList.add('btn-back-stt');
                        backButton.addEventListener('click', () => {
                            popupBackDiv.style.display = 'none';
                        });
                        divButtons.append(backButton)
                        return backButton
                    }

                // == Disconnect Button ==
                    function disconnectButton(evtSource,connectButtonElement){
                        const disconnectButtonElement = document.createElement('button')
                        disconnectButtonElement.textContent = 'DISCONNECT';
                        disconnectButtonElement.classList.add('btn-confirm-stt');
                        disconnectButtonElement.addEventListener('click', async () => {
                            const disconnect = await fetch(`${serverUrl}/whatsapp/disconnect_user?user_id=${userId}`);
                            const disconnected = await disconnect.json()
                            if(disconnected.disconnected){
                                qrCode_loadingDiv.replaceChildren()
                                subTitle.textContent = 'DISCONNECTED'
                                divButtons.replaceChild(connectButtonElement,disconnectButtonElement)
                                evtSource.close()
                            }
                        });
                        return disconnectButtonElement
                    }
                // == Connect Button ==
                    function connectButton(){
                        const connectButtonElement = document.createElement('button')
                        connectButtonElement.textContent = 'CONNECT';
                        connectButtonElement.id = 'connect-whatsapp';
                        connectButtonElement.classList.add('btn-confirm-stt');
                        connectButtonElement.addEventListener('click', async () => {
                            console.log("14. connect button clicked")
                            divButtons.style.display = 'none'
                            qrCode_loadingDiv.replaceChildren()
                            loadingDiv('Creating whatsapp client...')
                            subTitle.textContent = 'Wait while whatsapp service starts chrome service'
                            const connected = await fetch(`${serverUrl}/whatsapp/connect_user?user_id=${userId}`);
                            const connectedUser = await connected.json()
                            if(connectedUser.user){
                                qrCode_loadingDiv.replaceChildren()
                                loadingDiv('Generating...')
                                subTitle.textContent = 'Wait while we are generating you QR code'
                                try {
                                    const evtSource = new EventSource(`${serverUrl}/whatsapp/stream?user_id=${userId}`);
                                    evtSource.addEventListener('qr', (event) => {
                                        const img = document.createElement('img');
                                        img.onload = () => {
                                            qrCode_loadingDiv.replaceChildren(img);
                                            subTitle.textContent = "Please scan the QR code from your mobile device.";
                                            divButtons.style.display = 'block'
                                            const disconnect = disconnectButton(evtSource,connectButtonElement)
                                            divButtons.replaceChildren()
                                            divButtons.appendChild(disconnect)
                                            divButtons.appendChild(connectButtonElement)
                                        };
                                        img.src = event.data;
                                    });
                                    evtSource.addEventListener('status', (event) => {
                                        // == Node is running =======
                                        // == Waiting stream response == 
                                        if (event.data === 'waiting') {
                                            qrCode_loadingDiv.replaceChildren()    
                                            loadingDiv('Waiting for QR...');
                                        }

                                        // == Node is running =======
                                        // == Client doesn't exist == 
                                        if (event.data === 'session-removed') {
                                            evtSource.close();
                                            qrCode_loadingDiv.replaceChildren()
                                            divButtons.style.display = 'block'
                                        }
                                    });

                                } catch (err) {
                                    console.error('Erro :',err)
                                }
                                   

                            }else{
                                qrCode_loadingDiv.replaceChildren()
                                subTitle.textContent = 'Client not created. Try it again.'
                                divButtons.style.display = 'block'
                            }
                        })
                        divButtons.append(connectButtonElement)
                        return connectButtonElement
                    }

                // == Start whatsapp service button + function ==  
                    function startWahtsapp(buttonTitle, startRestart) {
                        console.log("5. Inside startWhatsapp function")
                        Array.from(popupFrontDiv.children).forEach(item => {
                            if(item.id === 'start-id'){
                                item.remove()
                            }
                        })
                        const startRestartButton = document.createElement('button')
                        startRestartButton.id = 'start-id'
                        startRestartButton.style.padding = '4px';
                        startRestartButton.textContent =  buttonTitle
                        startRestartButton.addEventListener('click', async () => {
                            qrCode_loadingDiv.replaceChildren()
                            if(startRestart === 'start'){
                                console.log("6. Start whatsapp button pressed")
                                subTitle.textContent = 'Please, wait while whatsapp service starts'
                                loadingDiv('Starting Node.js server')
                                const nodeStarted = await fetch(`${serverUrl}/whatsapp/node_start`);
                                const nodeStatus = await nodeStarted.json()
                                qrCode_loadingDiv.replaceChildren()
                                subTitle.textContent = nodeStatus.message
                                const backButtonElement = backButton()
                                const connectButtonElement = connectButton()
                                startRestartButton.textContent = 'Restart Whatsapp Service'
                            }else{
                                console.log("7. Restart whatsapp button pressed")
                                divButtons.style.display = 'none'
                                subTitle.textContent = 'Please, wait while whatsapp service restarts'
                                loadingDiv('Stopping Node.js server')
                                const nodeStop = await fetch(`${serverUrl}/whatsapp/node_stop`);
                                const stopStatus = await nodeStop.json()
                                console.log("8. Restart response 1 - stop",stopStatus)
                                subTitle.textContent = stopStatus.message
                                qrCode_loadingDiv.replaceChildren()
                                loadingDiv('Restarting Node.js server')
                                const nodeRestart = await fetch(`${serverUrl}/whatsapp/node_start`);
                                const restartStatus = await nodeRestart.json()
                                console.log("9. Restart response 2",restartStatus)
                                subTitle.textContent = restartStatus.message
                                qrCode_loadingDiv.replaceChildren()
                                divButtons.style.display = 'block'
                            }

                            
                        })
                        popupFrontDiv.append(startRestartButton)  
                    }

                // == Check user state ===================================
                // == NODE : already started =============================
                    async function userStatus(id){
                        const userStatus = await fetch(`${serverUrl}/whatsapp/user_status?user_id=${id}`);
                        const status = await userStatus.json();
                        console.log("10. userStatus function response ", status)
                        if(status.connected){ // Aqui o Evento ja esta na fila 
                            console.log("11. status.connected = true")
                            subTitle.textContent = `LOOKING FOR QR CODE = USER: ${status.email} - CELL PHONE NUMBER : ${status.number}`
                            loadingDiv('QR Code...')
                            try {
                                const evtSource = new EventSource(`${serverUrl}/whatsapp/stream?user_id=${userId}`);
                                evtSource.addEventListener('qr', (event) => {
                                    const img = document.createElement('img');
                                    img.onload = () => {
                                        qrCode_loadingDiv.replaceChildren(img);
                                        subTitle.textContent = "Please scan the QR code from your mobile device.";
                                        const back = backButton()
                                        divButtons.appendChild(back)
                                        const disconnect = disconnectButton(evtSource)
                                        divButtons.appendChild(disconnect)
                                    };
                                    img.src = event.data;
                                });
                                evtSource.addEventListener('status', (event) => {
                                    if (event.data === 'waiting') {
                                        console.log("12. status = waiting")
                                        loadingDiv('Waiting for QR...');
                                    }

                                    if (event.data === 'session-removed') {
                                        console.log("13. status = session-removed")
                                        // evtSource.close();
                                        qrCode_loadingDiv.replaceChildren()
                                        const back = backButton()
                                        const connect = connectButton()
                                    }
                                });
                            } catch (err) {
                                console.error('Erro :',err)
                            }
                        }else{
                            subTitle.textContent = "YOur whatsapp client was removed, please connect again.";
                            qrCode_loadingDiv.replaceChildren();
                            const back = backButton()
                            const connect = connectButton()
                            console.log("12. status.connected = false")
                        }
                    }

                // == Node running state function ==
                    function nodeRunning(){
                        console.log('4. Inside nodeRunning function')
                        qrCode_loadingDiv.replaceChildren()
                        subTitle.textContent = 'WhatsApp service is running'
                        userStatus(userId)
                        startWahtsapp('Restart Whatsapp Service', 'restart')
                    }
                // == Node stopped state function ==
                    function nodeStopped(){
                        console.log('3. Inside nodeStopped function')
                        qrCode_loadingDiv.replaceChildren()
                        subTitle.textContent = 'WhatsApp service is not running. Click "Start" to get it up and running'
                        startWahtsapp('Start Whatsapp Service', 'start')
                    }

                // == Check if Node is running + ==
                    function nodeRunningStopped(status){
                        console.log('1. Inside funciton NodeRunningstopped', status)
                        if(status.running){
                            subTitle.textContent = 'Checking whatsapp client status.'
                            loadingDiv('Updating Client Status')
                        }else{
                            subTitle.textContent = 'Please start whatsapp service.'
                            loadingDiv('Updating Client Status')
                        }
                        qrCode_loadingDiv.replaceChildren()
                        subTitle.textContent = 'WhatsApp service is not running. Click "Start" to get it up and running'
                        // Aguarda usuario iniciar o Node => clicat no botao iniciar whatsapp
                        startWahtsapp('Start Whatsapp Service', 'start')
                    }

                // == MAIN FUNCTION =============================================================================
                // == Web whatsapp button function ==============================================================
                    webWhatsappButton.addEventListener('click', async () => {
                        
                        Array.from(popupFrontDiv.children).forEach(item => {
                            if(item.id === 'start-id'){
                                item.remove()
                            }
                        })
                        divButtons.replaceChildren()
                        popupBackDiv.style.display = 'block'
                        title.textContent = 'Welcome to Magimagi WhatsApp Integration.'
                        title.style.backgroundColor = '#a3ada7ff';
                        title.style.fontWeight = 'bold';
                        title.style.padding = '10px';
                        title.style.borderRadius = '8px';
                        subTitle.textContent = 'Checking the WhatsApp service status for your account. Please wait…'
                        loadingDiv('Updating Whatsapp Service')
                        // Endpoint sone_status verifica se Node esta rodando via socket
                        const whatsRunning = await fetch(`${serverUrl}/whatsapp/node_status`);
                        const status = await whatsRunning.json();
                        console.log(status)
                        nodeRunningStopped(status)
                    })
            // WHATSAPP SERVICES ==============================================
            // ================================================================
           
    }
    
    // CALL DOC PAGE (VERSION INFO) ==================================
    document.getElementById("setting-btn-doc").addEventListener('click', function(){
            window.location.href = `${serverUrl}/doc/doc-page`
        })
    // CALL MAIN PAGE ================================================
    document.getElementById("setting-btn-desktop").addEventListener('click', function(){
        window.location.href = `${serverUrl}/tasks/main-task`
    })

})
