let faqData = [];

async function loadFAQ() {
  try {
    const res = await fetch("faq.json");
    faqData = await res.json();
  } catch (err) {
    console.error("Failed to load faq.json", err);
    faqData = [];
  }
}

function appendMessage(text, sender) {
  const chat = document.getElementById("chatWindow");
  const div = document.createElement("div");
  div.className = "chat-message " + sender;
  div.textContent = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

function resetChat() {
  document.getElementById("chatWindow").innerHTML = "";
}

function getSuggestions(input) {
  if (!input) return [];
  input = input.toLowerCase();

  return faqData
    .filter(item =>
      item.question.toLowerCase().includes(input) ||
      item.keywords.some(k => k.toLowerCase().includes(input))
    )
    .slice(0, 20);
}

function getAnswer(input) {
  input = input.toLowerCase();

  const match = faqData.find(item =>
    item.question.toLowerCase().includes(input) ||
    item.keywords.some(k => input.includes(k.toLowerCase()))
  );

  if (match) return match.answer;

  return "I couldn't find the information you're looking for. I will forward your request to a live support agent who will assist you shortly.";
}

function showTyping() {
  document.getElementById("typingIndicator").classList.remove("hidden");
}

function hideTyping() {
  document.getElementById("typingIndicator").classList.add("hidden");
}

function sendMessage() {
  const input = document.getElementById("userInput");
  const question = input.value.trim();
  if (!question) return;

  appendMessage(question, "user");
  input.value = "";
  hideSuggestions();

  showTyping();

  setTimeout(() => {
    const answer = getAnswer(question);
    appendMessage(answer, "ai");
    hideTyping();
  }, 1500);
}

function showSuggestions(list) {
  const box = document.getElementById("suggestions");
  box.innerHTML = "";

  if (list.length === 0) {
    box.style.display = "none";
    return;
  }

  list.forEach(item => {
    const div = document.createElement("div");
    div.className = "suggestion-item";
    div.textContent = item.question;

    div.onclick = () => {
      document.getElementById("userInput").value = item.question;
      hideSuggestions();
      sendMessage();
    };

    box.appendChild(div);
  });

  box.style.display = "block";
}

function hideSuggestions() {
  document.getElementById("suggestions").style.display = "none";
}

window.onload = async () => {
  await loadFAQ();

  document.getElementById("sendBtn").addEventListener("click", sendMessage);
  document.getElementById("resetBtn").addEventListener("click", resetChat);
  document.getElementById("year").textContent = new Date().getFullYear();

  const input = document.getElementById("userInput");

  input.addEventListener("keypress", e => {
    if (e.key === "Enter") sendMessage();
  });

  input.addEventListener("input", () => {
    const text = input.value.trim();
    showSuggestions(getSuggestions(text));
  });

  document.addEventListener("click", (e) => {
    if (e.target.id !== "userInput") hideSuggestions();
  });
};
