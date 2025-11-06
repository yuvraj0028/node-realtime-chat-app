// Socket.io connection - for remote server
const socket = io(window.location.origin);

// Elements
const $messageForm = document.querySelector("#message-form");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("#send-btn");
const $messages = document.querySelector("#messages");
const $roomName = document.querySelector("#room-name");
const $connectionStatus = document.querySelector(".status-indicator");
const $statusText = document.querySelector(".status-text");

// Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

// Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

// Connection status management
let isConnected = true;

socket.on('connect', () => {
  isConnected = true;
  updateConnectionStatus(true);
});

socket.on('disconnect', () => {
  isConnected = false;
  updateConnectionStatus(false);
});

function updateConnectionStatus(connected) {
  if (connected) {
    $connectionStatus.classList.remove('offline');
    $connectionStatus.classList.add('online');
    $statusText.textContent = 'Connected';
  } else {
    $connectionStatus.classList.remove('online');
    $connectionStatus.classList.add('offline');
    $statusText.textContent = 'Disconnected';
  }
}

// Auto scroll functionality
const autoScroll = () => {
  // New message element
  const $newMessage = $messages.lastElementChild;

  if (!$newMessage) return;

  // height of the new message
  const newMessageStyle = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyle.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  // visible height
  const visibleHeight = $messages.offsetHeight;

  // height of messages container
  const containerHeight = $messages.scrollHeight;

  // how far have I scrolled?
  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

// Message handling
socket.on("message", (message) => {
  const isOwnMessage = message.username === username;
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format("HH:mm"),
    isOwn: isOwnMessage
  });
  
  // Remove welcome message if it exists
  const welcomeMessage = $messages.querySelector('.welcome-message');
  if (welcomeMessage) {
    welcomeMessage.remove();
  }
  
  $messages.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

socket.on("roomData", ({ room, users }) => {
  const usersWithCurrent = users.map(user => ({
    ...user,
    isCurrentUser: user.username === username
  }));
  
  const html = Mustache.render(sidebarTemplate, {
    room: room,
    users: usersWithCurrent,
  });
  document.querySelector("#sidebar").innerHTML = html;
  $roomName.textContent = room;
});

// Form submission
$messageForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // disable form after submit
  $messageFormButton.setAttribute("disabled", "disabled");
  $messageFormButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

  const message = $messageFormInput.value.trim();

  if (message === "") {
    // enable form after submit
    $messageFormButton.removeAttribute("disabled");
    $messageFormButton.innerHTML = '<i class="fas fa-paper-plane"></i>';
    return;
  }
  
  socket.emit("sendMessage", message, (error) => {
    // enable form after submit
    $messageFormButton.removeAttribute("disabled");
    $messageFormButton.innerHTML = '<i class="fas fa-paper-plane"></i>';
    // clear input
    $messageFormInput.value = "";
    // focus input
    $messageFormInput.focus();
    
    if (error) {
      showNotification(error, 'error');
      return console.log(error);
    }
    
    showNotification('Message sent!', 'success');
  });
});

// Join room
socket.emit("join", { username, room }, (error) => {
  if (error) {
    showNotification(error, 'error');
    setTimeout(() => {
      location.href = "/";
    }, 2000);
  }
});

// Notification system
function showNotification(message, type = 'info') {
  // Remove existing notifications
  const existingNotifications = document.querySelectorAll('.notification');
  existingNotifications.forEach(notification => notification.remove());
  
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <i class="fas fa-${getNotificationIcon(type)}"></i>
    <span>${message}</span>
    <button onclick="this.parentElement.remove()">
      <i class="fas fa-times"></i>
    </button>
  `;
  
  document.body.appendChild(notification);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 5000);
}

function getNotificationIcon(type) {
  switch (type) {
    case 'success': return 'check-circle';
    case 'error': return 'exclamation-circle';
    case 'warning': return 'exclamation-triangle';
    default: return 'info-circle';
  }
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // Ctrl/Cmd + Enter to send message
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    $messageForm.dispatchEvent(new Event('submit'));
  }
  
  // Escape to clear input
  if (e.key === 'Escape') {
    $messageFormInput.value = '';
    $messageFormInput.blur();
  }
});

// Input focus management
$messageFormInput.addEventListener('focus', () => {
  $messageFormInput.parentElement.classList.add('focused');
});

$messageFormInput.addEventListener('blur', () => {
  if (!$messageFormInput.value) {
    $messageFormInput.parentElement.classList.remove('focused');
  }
});

// Page visibility API for better UX
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    document.title = '💬 Chat App - Background';
  } else {
    document.title = 'Chat App - Chat';
  }
});

// Prevent form submission on Enter if Shift is held (for multi-line support)
$messageFormInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && e.shiftKey) {
    e.preventDefault();
    // Insert new line
    const start = e.target.selectionStart;
    const end = e.target.selectionEnd;
    const value = e.target.value;
    e.target.value = value.substring(0, start) + '\n' + value.substring(end);
    e.target.selectionStart = e.target.selectionEnd = start + 1;
  }
});

