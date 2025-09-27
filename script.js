const repoOwner = "AnoniKolo";
const repoName = "anonikolo.github.io";
const messagesFilePath = "messages.json";

document.addEventListener("DOMContentLoaded", () => {
    const messageList = document.getElementById("message-list");
    const messageForm = document.getElementById("message-form");
    const messageInput = document.getElementById("message-input");

    // Funkcja do ładowania wiadomości z pliku
    async function loadMessages() {
        try {
            const response = await fetch(`https://raw.githubusercontent.com/${repoOwner}/${repoName}/main/${messagesFilePath}`);
            if (response.ok) {
                const data = await response.text(); // Pobieramy wiadomości jako tekst
                const messages = data.split("\n").filter(line => line.trim() !== ""); // Każda linia to wiadomość
                messageList.innerHTML = messages.map(msg => `<div>${msg}</div>`).join("");
            } else {
                messageList.innerHTML = "<div>Brak wiadomości.</div>";
            }
        } catch (error) {
            console.error("Błąd podczas ładowania wiadomości:", error);
        }
    }

    // Funkcja do wysyłania wiadomości
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

            let fileContent = "";
            let sha = null;

            if (response.ok) {
                const data = await response.json();
                fileContent = atob(data.content); // Dekodowanie istniejących wiadomości
                sha = data.sha;
            }

            // Dodajemy nową wiadomość jako nową linię z godzina i minutą
            const now = new Date();
            const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
            const newMessage = `${message} (${time})`;
            const updatedContent = fileContent + newMessage + "\n";

            await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${messagesFilePath}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    message: "Dodano nową wiadomość",
                    content: btoa(updatedContent), // Kodowanie treści w Base64
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