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

            
        // ==========================================================================
        // WHATSAPP MODULE ==========================================================
            // SPIN ============================
            function createLoadingComponent() {
                const container = document.createElement('div');
                container.classList.add('loading-container');

                const spinner = document.createElement('div');
                spinner.classList.add('spinner');

                const text = document.createElement('div');
                text.classList.add('loading-text');
                text.textContent = 'Generating QR Code...';

                container.append(spinner, text);
                return container;
            }
        
            document.getElementById("setting-btn-whatsapp").addEventListener('click', function () {
                const popupBack = document.getElementById("popup-id-back");
                const popupTitleLabel = document.getElementById('popup-title-label');
                const popupTitle = document.getElementById('popup-title');
                const popupMessageLabel = document.getElementById('popup-message-label');
                const divBtn = document.getElementById('div-btn-stt');

                popupBack.style.display = 'block';

                // Configura o título
                popupTitleLabel.style.backgroundColor = '#a3ada7ff';
                popupTitleLabel.style.fontWeight = 'bold';
                popupTitleLabel.style.padding = '10px';
                popupTitleLabel.style.borderRadius = '8px';
                popupTitleLabel.textContent = 'WELCOME TO THE MAGIMAGI WHATSAPP INTEGRATION!';

                popupTitle.textContent = 'Please confirm to generate the QR code to connect your WhatsApp.';
                popupTitle.style.fontSize = '1.2rem';
                popupTitle.style.marginTop = '40px';

                // Limpa botões
                divBtn.replaceChildren();

                // Botão BACK
                const btnBack = document.createElement('button');
                btnBack.textContent = 'BACK';
                btnBack.classList.add('btn-back-stt');
                btnBack.addEventListener('click', () => {
                    popupBack.style.display = 'none';
                    divBtn.replaceChildren();
                    popupMessageLabel.replaceChildren();
                    // Remove QR antigo
                    popupMessageLabel.innerHTML = '';
                });

                // Botão DISCONNECT
                const btnDisconnect = document.createElement('button');
                btnDisconnect.textContent = 'DISCONNECT';
                btnDisconnect.classList.add('btn-disconnect-stt');
                btnDisconnect.style.display = 'none'; // inicia escondido
                btnDisconnect.addEventListener('click', () => {
                    fetch(`${serverUrl}/whatsapp/disconnect`, { method: 'POST' })
                        .then(() => {
                            alert('WhatsApp disconnected!');
                            popupMessageLabel.innerHTML = '';
                            divBtn.replaceChildren();
                            divBtn.appendChild(btnBack);
                        })
                        .catch(err => console.error(err));
                });

                // Botão CONFIRM
                const btnConfirm = document.createElement('button');
                btnConfirm.textContent = 'CONFIRM';
                btnConfirm.classList.add('btn-confirm-stt');

                btnConfirm.addEventListener('click', function () {
                    // Esconde título e botões
                    popupTitle.textContent = '';
                    divBtn.replaceChildren();

                    // Mostra loading
                    const loading = createLoadingComponent();
                    popupMessageLabel.replaceChildren();
                    popupMessageLabel.appendChild(loading);

                    // Inicia EventSource para QR
                    const evtSource = new EventSource(`${serverUrl}/whatsapp/stream`);

                    evtSource.onmessage = function(event) {
                        // Remove loading e QR antigo
                        popupMessageLabel.replaceChildren();

                        // Cria nova imagem QR
                        const img = document.createElement('img');
                        img.src = event.data;
                        img.style.width = '250px';
                        img.alt = 'QR Code WhatsApp';
                        popupMessageLabel.appendChild(img);

                        // Exibe Back e Disconnect
                        divBtn.replaceChildren();
                        divBtn.appendChild(btnBack);
                        divBtn.appendChild(btnDisconnect);
                        btnDisconnect.style.display = 'inline-block';
                    };

                    evtSource.onerror = function() {
                        divBtn.replaceChildren();
                        const error = document.createElement('p');
                        error.textContent = 'Erro ao conectar ao WhatsApp.';
                        error.style.color = 'red';
                        divBtn.appendChild(error);

                        evtSource.close();
                    };
                });

                // Adiciona botões iniciais
                divBtn.append(btnBack, btnConfirm);
            });

        // WHATSAPP MODULE ==========================================================
        // ==========================================================================


    }
    document.getElementById("setting-btn-doc").addEventListener('click', function(){
            window.location.href = `${serverUrl}/doc/doc-page`
        })
    // CALL MAIN PAGE ================================================
    document.getElementById("setting-btn-desktop").addEventListener('click', function(){
        window.location.href = `${serverUrl}/tasks/main-task`
    })

})
