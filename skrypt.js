const repoOwner = "AnoniKolo";
const repoName = "anonikolo.github.io";
const messagesFilePath = "messages.json";

document.addEventListener("DOMContentLoaded", () => {
    const messageList = document.getElementById("message-list");
    const messageForm = document.getElementById("message-form");
    const messageInput = document.getElementById("message-input");

    // Funkcja ładowania wiadomości z GitHub
    async function loadMessages() {
        try {
            const response = await fetch(`https://raw.githubusercontent.com/${repoOwner}/${repoName}/main/${messagesFilePath}`);
            if (response.ok) {
                const messages = await response.json();
                messageList.innerHTML = messages.map(msg => `<div>${msg.text}</div>`).join("");
            } else {
                messageList.innerHTML = "<div>Brak wiadomości.</div>";
            }
        } catch (error) {
            console.error("Błąd podczas ładowania wiadomości:", error);
        }
    }

    // Funkcja wysyłania wiadomości
    async function sendMessage(message) {
        const token = prompt("Wprowadź token GitHub (z uprawnieniami do repozytorium)");
        if (!token) return;

        try {
            const response = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${messagesFilePath}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            let messages = [];
            let sha = null;

            if (response.ok) {
                const data = await response.json();
                messages = JSON.parse(atob(data.content));
                sha = data.sha;
            }

            messages.push({ text: message, timestamp: new Date().toISOString() });

            await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${messagesFilePath}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    message: "Dodano nową wiadomość",
                    content: btoa(JSON.stringify(messages)),
                    sha: sha
                })
            });

            loadMessages();
        } catch (error) {
            console.error("Błąd podczas wysyłania wiadomości:", error);
        }
    }

    // Obsługa formularza wysyłania wiadomości
    messageForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const message = messageInput.value.trim();
        if (message) {
            sendMessage(message);
            messageInput.value = "";
        }
    });

    loadMessages();
});
