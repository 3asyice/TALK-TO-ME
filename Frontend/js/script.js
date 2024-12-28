// login elements
const login = document.querySelector(".login");
const loginForm = login.querySelector(".login__form");
const loginInput = login.querySelector(".login__input");

// chat elements
const chat = document.querySelector(".chat");
const chatForm = chat.querySelector(".chat__form");
const chatInput = chat.querySelector(".chat__input");
const chatMessages = chat.querySelector(".chat__messages");
const usersList = chat.querySelector(".users-list");
const chatFileInput = chat.querySelector(".chat__file-input");

const colors = [
    "#00FFFF", // Aqua
    "#FF00FF", // Fuchsia
    "#FF1493", // DeepPink
    "#00BFFF", // DeepSkyBlue
    "#8A2BE2", // BlueViolet
    "#FF4500", // OrangeRed
    "#ADFF2F", // GreenYellow
    "#FF6347", // Tomato
    "#FF7F50", // Coral
    "#1E90FF", // DodgerBlue
    "#DA70D6", // Orchid
    "#FFD700", // Gold
    "#7FFF00", // Chartreuse
    "#00FA9A", // MediumSpringGreen
    "#FF8C00", // DarkOrange
    "#9400D3", // DarkViolet
    "#00FF7F", // SpringGreen
    "#BA55D3", // MediumOrchid
    "#FF69B4", // HotPink
    "#B22222", // FireBrick
    "#FFB6C1", // LightPink
    "#ADFF2F", // GreenYellow
    "#32CD32", // LimeGreen
    "#8B008B", // DarkMagenta
    "#7B68EE", // MediumSlateBlue
    "#48D1CC", // MediumTurquoise
    "#9B30FF", // Purple
    "#FF00FF", // Magenta
    "#00CED1", // DarkTurquoise
    "#FF1493", // DeepPink
    "#8B0000", // DarkRed
    "#FFD700", // Gold
    "#00FF00", // Lime
    "#7FFF00", // Chartreuse
    "#B0E0E6", // PowderBlue
    "#FF6347", // Tomato
    "#FF8C00", // DarkOrange
    "#00BFFF", // DeepSkyBlue
    "#9932CC", // DarkOrchid
    "#FF77FF", // BrightPink
    "#7B68EE", // MediumSlateBlue
    "#FF4500", // OrangeRed
    "#FF69B4", // HotPink
    "#C71585", // MediumVioletRed
    "#BA55D3", // MediumOrchid
    "#FFD700", // Gold
    "#FFB6C1", // LightPink
    "#FF1493", // DeepPink
    "#2E8B57", // SeaGreen
    "#1E90FF", // DodgerBlue
    "#FF6347", // Tomato
    "#ADFF2F", // GreenYellow
    "#FF00FF", // Magenta
    "#8A2BE2", // BlueViolet
    "#00FFFF", // Aqua
    "#FF00FF", // Fuchsia
    "#8B008B", // DarkMagenta
    "#FF8C00", // DarkOrange
    "#9400D3", // DarkViolet
    "#00FA9A", // MediumSpringGreen
    "#32CD32", // LimeGreen
    "#FF69B4", // HotPink
    "#FF4500", // OrangeRed
    "#7FFF00", // Chartreuse
    "#C71585", // MediumVioletRed
    "#FF77FF", // BrightPink
    "#4682B4", // SteelBlue
    "#5F9EA0", // CadetBlue
    "#66CDAA", // MediumAquamarine
    "#20B2AA", // LightSeaGreen
    "#FFB6C1", // LightPink
    "#FF1493", // DeepPink
    "#FFD700", // Gold
    "#FF4500", // OrangeRed
    "#9932CC", // DarkOrchid
    "#ADFF2F", // GreenYellow
    "#00CED1", // DarkTurquoise
    "#FF6347", // Tomato
    "#8B0000", // DarkRed
    "#00BFFF", // DeepSkyBlue
    "#FF69B4", // HotPink
    "#FF00FF", // Magenta
    "#7B68EE", // MediumSlateBlue
    "#32CD32", // LimeGreen
    "#8A2BE2", // BlueViolet
    "#00FFFF", // Aqua
    "#FF00FF", // Fuchsia
    "#FF1493", // DeepPink
    "#00BFFF", // DeepSkyBlue
    "#FF4500", // OrangeRed
    "#ADFF2F", // GreenYellow
    "#00FA9A", // MediumSpringGreen
    "#FF6347", // Tomato
    "#7FFF00", // Chartreuse
    "#FF7F50", // Coral
    "#1E90FF" // DodgerBlue
];

const user = { id: "", name: "", color: "" };

let websocket;
let onlineUsers = new Set();
let mediaRecorder;
let audioChunks = [];

// Função para criar um elemento de mensagem do próprio usuário
const createMessageSelfElement = (content) => {
    const div = document.createElement("div");
    const timeSpan = document.createElement("span");

    div.classList.add("message--self");
    div.innerHTML = content;

    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    timeSpan.innerHTML = currentTime;
    timeSpan.classList.add("message-time");

    div.appendChild(timeSpan);
    return div;
}

// Função para criar um elemento de mensagem de outro usuário
const createMessageOtherElement = (content, sender, senderColor) => {
    const div = document.createElement("div");
    const span = document.createElement("span");
    const timeSpan = document.createElement("span");

    div.classList.add("message--other");

    span.classList.add("message--sender");
    span.style.color = senderColor;

    span.innerHTML = sender;
    div.appendChild(span);
    div.innerHTML += content;

    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    timeSpan.innerHTML = currentTime;
    timeSpan.classList.add("message-time");

    div.appendChild(timeSpan);
    return div;
}

// Função para armazenar mensagens (texto, áudio, imagem, PDF e vídeo) no localStorage
const storeMessage = (message) => {
    const messages = JSON.parse(localStorage.getItem("chatMessages")) || [];
    messages.push(message);
    localStorage.setItem("chatMessages", JSON.stringify(messages));
}

// Função para carregar mensagens do localStorage
const loadMessages = () => {
    const messages = JSON.parse(localStorage.getItem("chatMessages")) || [];
    messages.forEach(msg => {
        if (msg.event === "audio_message") {
            const audioElement = document.createElement('audio');
            audioElement.controls = true;
            audioElement.src = `data:audio/wav;base64,${msg.content}`;

            const messageElement = createMessageOtherElement(audioElement.outerHTML, msg.userName, msg.userColor);
            chatMessages.appendChild(messageElement);
        } else if (msg.event === "image_message") {
            const imgElement = document.createElement('img');
            imgElement.src = `data:image/png;base64,${msg.content}`;
            imgElement.style.maxWidth = '100%';

            const messageElement = createMessageOtherElement(imgElement.outerHTML, msg.userName, msg.userColor);
            chatMessages.appendChild(messageElement);
        } else if (msg.event === "pdf_message") {
            const pdfLink = document.createElement('a');
            pdfLink.href = `data:application/pdf;base64,${msg.content}`;
            pdfLink.textContent = "Arquivo PDF enviado";
            pdfLink.target = "_blank"; // Abre em nova aba
            pdfLink.download = "document.pdf"; // Sugere um nome para download
            pdfLink.style.color = '#FFDD00'; // Cor do link

            const messageElement = createMessageOtherElement(pdfLink.outerHTML, msg.userName, msg.userColor);
            chatMessages.appendChild(messageElement);
        } else if (msg.event === "video_message") {
            const videoElement = document.createElement('video');
            videoElement.controls = true;
            videoElement.src = `data:video/mp4;base64,${msg.content}`; // Supondo que o vídeo seja MP4
            videoElement.style.maxWidth = '100%';

            const messageElement = createMessageOtherElement(videoElement.outerHTML, msg.userName, msg.userColor);
            chatMessages.appendChild(messageElement);
        } else {
            const messageElement =
                msg.userId === user.id
                    ? createMessageSelfElement(msg.content)
                    : createMessageOtherElement(msg.content, msg.userName, msg.userColor);
            chatMessages.appendChild(messageElement);
        }
    });
    scrollScreen();
}

const getRandomColor = () => {
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
}

const scrollScreen = () => {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

const updateOnlineUsers = () => {
    usersList.innerHTML = "";
    onlineUsers.forEach(userName => {
        const userDiv = document.createElement("div");
        userDiv.textContent = userName;
        usersList.appendChild(userDiv);
    });
}

const processMessage = ({ data }) => {
    const { userId, userName, userColor, content, event } = JSON.parse(data);

    if (event === "user_connected") {
        onlineUsers.add(userName);
        updateOnlineUsers();
    } else if (event === "user_disconnected") {
        onlineUsers.delete(userName);
        updateOnlineUsers();
    } else if (event === "audio_message") {
        const audioElement = document.createElement('audio');
        audioElement.controls = true;
        audioElement.src = `data:audio/wav;base64,${content}`;

        const messageElement = createMessageOtherElement(audioElement.outerHTML, userName, userColor);
        chatMessages.appendChild(messageElement);

        storeMessage({
            userId,
            userName,
            userColor,
            content: content,
            event: "audio_message"
        });

        scrollScreen();
    } else if (event === "image_message") {
        const imgElement = document.createElement('img');
        imgElement.src = `data:image/png;base64,${content}`;
        imgElement.style.maxWidth = '100%';

        const messageElement = createMessageOtherElement(imgElement.outerHTML, userName, userColor);
        chatMessages.appendChild(messageElement);

        storeMessage({
            userId,
            userName,
            userColor,
            content: content,
            event: "image_message"
        });

        scrollScreen();
    } else if (event === "pdf_message") {
        const pdfLink = document.createElement('a');
        pdfLink.href = `data:application/pdf;base64,${content}`;
        pdfLink.textContent = "PDF ARCHIVE";
        pdfLink.target = "_blank"; // Abre em nova aba
        pdfLink.download = "pdf__archive.pdf"; // Sugere um nome para download
        pdfLink.style.color = '#FFDD00'; // Cor do link

        const messageElement = createMessageOtherElement(pdfLink.outerHTML, userName, userColor);
        chatMessages.appendChild(messageElement);

        storeMessage({
            userId,
            userName,
            userColor,
            content: content,
            event: "pdf_message"
        });

        scrollScreen();
    } else if (event === "video_message") {
        const videoElement = document.createElement('video');
        videoElement.controls = true;
        videoElement.src = `data:video/mp4;base64,${content}`; // Supondo que o vídeo seja MP4
        videoElement.style.maxWidth = '100%';

        const messageElement = createMessageOtherElement(videoElement.outerHTML, userName, userColor);
        chatMessages.appendChild(messageElement);

        storeMessage({
            userId,
            userName,
            userColor,
            content: content,
            event: "video_message"
        });

        scrollScreen();
    } else {
        const message = {
            userId,
            userName,
            userColor,
            content
        };

        storeMessage(message);

        const messageElement =
            userId === user.id
                ? createMessageSelfElement(content)
                : createMessageOtherElement(content, userName, userColor);

        chatMessages.appendChild(messageElement);
        scrollScreen();
    }
}

const handleLogin = (event) => {
    event.preventDefault();

    user.id = crypto.randomUUID();
    user.name = loginInput.value;
    user.color = getRandomColor();

    login.style.display = "none";
    chat.style.display = "flex";

    loadMessages();
    
    Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
            console.log("Permissão para notificações concedida.");
        } else {
            console.log("Permissão para notificações negada.");
        }
    });


    websocket = new WebSocket("wss://chat-online-azd6.onrender.com/");
    websocket.onmessage = processMessage;

    websocket.send(JSON.stringify({ event: "user_connected", userName: user.name, userId: user.id }));
}

const sendMessage = (event) => {
    event.preventDefault();

    const message = {
        userId: user.id,
        userName: user.name,
        userColor: user.color,
        content: chatInput.value
    };

    websocket.send(JSON.stringify(message));
    chatInput.value = "";
}

// Função para enviar um arquivo (imagem, áudio, PDF ou vídeo)
const sendFile = (file) => {
    const reader = new FileReader();
    reader.onloadend = () => {
        const fileData = reader.result.split(',')[1];
        const fileMessage = {
            userId: user.id,
            userName: user.name,
            userColor: user.color,
            content: fileData,
            event: file.type.startsWith('audio/') ? "audio_message" :
                   file.type.startsWith('image/') ? "image_message" :
                   file.type === 'application/pdf' ? "pdf_message" :
                   file.type.startsWith('video/') ? "video_message" : null // Adiciona suporte a vídeos
        };
        
        if (fileMessage.event) {
            websocket.send(JSON.stringify(fileMessage));
        }
    };
    reader.readAsDataURL(file);
};

// Função para lidar com o upload de arquivos
chatFileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
        sendFile(file);
        chatFileInput.value = ""; // Limpa o campo após o envio
    }
});

// Função para iniciar a gravação
const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.start();
    mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
    };

    mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        sendAudio(audioBlob);
        audioChunks = [];
    };
};

// Função para parar a gravação
const stopRecording = () => {
    mediaRecorder.stop();
};

// Função para enviar o áudio para todos os usuários
const sendAudio = (audioBlob) => {
    const reader = new FileReader();
    reader.onloadend = () => {
        const audioData = reader.result.split(',')[1];
        const audioMessage = {
            userId: user.id,
            userName: user.name,
            userColor: user.color,
            content: audioData,
            event: "audio_message"
        };
        websocket.send(JSON.stringify(audioMessage));
    };
    reader.readAsDataURL(audioBlob);
};

// Adiciona eventos ao botão de gravação
document.getElementById('recordButton').addEventListener('click', () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        stopRecording();
    } else {
        startRecording();
    }
});

// Adiciona os eventos de login e envio de mensagens
loginForm.addEventListener("submit", handleLogin);
chatForm.addEventListener("submit", sendMessage);

const clearMessages = () => {
  chatMessages.innerHTML = ""; // Limpa o conteúdo da seção de mensagens
  localStorage.removeItem("chatMessages"); // Remove as mensagens do localStorage
}

// Adiciona evento ao botão de deletar mensagens
document.getElementById('deleteMessagesButton').addEventListener('click', clearMessages);

function a() {
  const menu = document.getElementById("z");
  menu.style.display = (menu.style.display === "block") ? "none" : "block";
}
function exportMessages() {
  const messages = JSON.parse(localStorage.getItem("chatMessages")) || [];

  // Constrói o conteúdo do arquivo TXT apenas com Nome e Mensagem
  const txtContent = messages.map(msg => {
    return `${msg.userName}: ${msg.content}`; // Formato: Nome: Mensagem
  }).join("\n");

  // Cria um Blob com o conteúdo
  const blob = new Blob([txtContent], { type: 'text/plain' });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "mensagens.txt"; // Nome do arquivo a ser baixado
  document.body.appendChild(link); // Necessário para Firefox

  link.click(); // Aciona o download
  document.body.removeChild(link); // Remove o link após o download
}


let deferredPrompt;
        
        window.addEventListener('beforeinstallprompt', (e) => {
          e.preventDefault();
          deferredPrompt = e;
          const addBtn = document.querySelector('#add-button');
          addBtn.style.display = 'flex';
        
          addBtn.addEventListener('click', () => {
            addBtn.style.display = 'block';
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult) => {
              if (choiceResult.outcome === 'accepted') {
                console.log('Usuário aceitou o prompt de instalação');
              } else {
                console.log('Usuário rejeitou o prompt de instalação');
              }
              deferredPrompt = null;
            });
          });
        });
        
        function sharePage() {
          const pageUrl = window.location.href;
          const pageTitle = document.title;
        
          if (navigator.share) {
            navigator.share({
              title: pageTitle,
              url: pageUrl,
            }).then(() => {
              console.log('Página compartilhada com sucesso.');
            }).catch((error) => {
              console.error('Erro ao compartilhar a página:', error);
            });
          } else {
            alert('O compartilhamento não é suportado neste navegador. Copie o link: ' + pageUrl);
          }
        }
        
        function showinfo() {
          const ifm = document.getElementById("infocon");
          ifm.style.display = (ifm.style.display === "block") ? "none" : "block";
        }
