const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');
const sendBtn = document.getElementById('send-btn');
const sidebarToggle = document.getElementById('sidebar-toggle');
const sidebar = document.getElementById('sidebar');
const newChatBtn = document.getElementById('new-chat');
const welcomeScreen = document.getElementById('welcome-screen');

// Auto-expand textarea
input.addEventListener('input', function () {
  this.style.height = 'auto';
  this.style.height = (this.scrollHeight) + 'px';
  sendBtn.disabled = !this.value.trim();
});

// Sidebar toggle for mobile
sidebarToggle.addEventListener('click', () => {
  sidebar.classList.toggle('show');
});

// New Chat
newChatBtn.addEventListener('click', () => {
  chatBox.innerHTML = '';
  chatBox.appendChild(welcomeScreen);
  input.value = '';
  input.style.height = 'auto';
  sendBtn.disabled = true;
});

// Handle Chat Submission
form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  // Remove welcome screen if it exists
  if (welcomeScreen.parentNode === chatBox) {
    chatBox.removeChild(welcomeScreen);
  }

  appendMessage('user', userMessage);
  input.value = '';
  input.style.height = 'auto';
  input.disabled = true;
  sendBtn.disabled = true;

  // Show thinking message
  const botMessageElement = appendMessage('bot', 'Thinking...');

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        conversation: [
          { role: 'user', text: userMessage }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error || response.statusText);
    }

    const data = await response.json();

    if (data && data.result) {
      updateBotMessage(botMessageElement, data.result);
    } else {
      updateBotMessage(botMessageElement, 'Sorry, no response received.');
    }
  } catch (error) {
    console.error('Error fetching chat response:', error);
    updateBotMessage(botMessageElement, `**Error:** ${error.message}`);
  } finally {
    input.disabled = false;
    input.focus();
    chatBox.scrollTop = chatBox.scrollHeight;
  }
});

function appendMessage(sender, text) {
  const wrapper = document.createElement('div');
  wrapper.classList.add('message-wrapper', sender);

  const avatar = document.createElement('div');
  avatar.classList.add('message-avatar');
  
  const icon = document.createElement('i');
  if (sender === 'user') {
    icon.setAttribute('data-lucide', 'user');
  } else {
    icon.setAttribute('data-lucide', 'bot');
  }
  avatar.appendChild(icon);

  const content = document.createElement('div');
  content.classList.add('message-content');
  
  if (sender === 'user') {
    content.textContent = text;
  } else {
    content.innerHTML = marked.parse(text);
  }

  wrapper.appendChild(avatar);
  wrapper.appendChild(content);
  chatBox.appendChild(wrapper);
  
  // Re-initialize Lucide for the new icon
  lucide.createIcons();
  
  chatBox.scrollTop = chatBox.scrollHeight;
  return content;
}

function updateBotMessage(element, text) {
  element.innerHTML = marked.parse(text);
  // Highlight any code blocks in the newly rendered HTML
  element.querySelectorAll('pre code').forEach((block) => {
    hljs.highlightElement(block);
  });
  chatBox.scrollTop = chatBox.scrollHeight;
}
