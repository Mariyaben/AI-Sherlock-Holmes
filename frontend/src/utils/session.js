// Session management utilities

export const generateSessionId = () => {
  // Generate a unique session ID
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 15);
  return `session_${timestamp}_${randomStr}`;
};

export const getSessionId = () => {
  // Get existing session ID from localStorage or generate new one
  let sessionId = localStorage.getItem('session_id');
  
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem('session_id', sessionId);
  }
  
  return sessionId;
};

export const clearSession = () => {
  // Clear session data
  localStorage.removeItem('session_id');
  localStorage.removeItem('chat_history');
};

export const saveChatToLocal = (sessionId, messages) => {
  // Save chat messages to localStorage as backup
  try {
    const key = `chat_${sessionId}`;
    localStorage.setItem(key, JSON.stringify(messages));
  } catch (error) {
    console.error('Failed to save chat to localStorage:', error);
  }
};

export const loadChatFromLocal = (sessionId) => {
  // Load chat messages from localStorage
  try {
    const key = `chat_${sessionId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load chat from localStorage:', error);
    return [];
  }
};

export const formatTimestamp = (timestamp) => {
  // Format timestamp for display
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  
  // Less than 1 minute
  if (diff < 60000) {
    return 'Just now';
  }
  
  // Less than 1 hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  }
  
  // Less than 1 day
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  
  // More than 1 day
  const days = Math.floor(diff / 86400000);
  return `${days} day${days > 1 ? 's' : ''} ago`;
};

export const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};
