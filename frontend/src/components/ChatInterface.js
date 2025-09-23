import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader, Bot, User, Trash2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';

import { sendMessage, getChatHistory, clearChatHistory } from '../services/api';
import { Button } from '../styles/GlobalStyles';

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 60px);
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
`;

const ChatHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const HeaderTitle = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: #e0e0e0;
  font-family: 'Crimson Text', serif;
  margin: 0;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 12px;
`;

const ChatMessages = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const MessageContainer = styled(motion.div)`
  display: flex;
  gap: 12px;
  align-items: flex-start;
  ${props => props.isUser && 'flex-direction: row-reverse;'}
`;

const MessageAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.isUser 
    ? 'linear-gradient(135deg, #4a9eff 0%, #357abd 100%)' 
    : 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
  };
  color: white;
  font-size: 16px;
  flex-shrink: 0;
`;

const MessageContent = styled(motion.div)`
  background: ${props => props.isUser 
    ? 'linear-gradient(135deg, #4a9eff 0%, #357abd 100%)' 
    : 'rgba(255, 255, 255, 0.05)'
  };
  border: ${props => props.isUser 
    ? 'none' 
    : '1px solid rgba(255, 255, 255, 0.1)'
  };
  border-radius: 16px;
  padding: 16px 20px;
  max-width: 70%;
  color: ${props => props.isUser ? 'white' : '#e0e0e0'};
  font-size: 14px;
  line-height: 1.6;
  word-wrap: break-word;
  
  ${props => props.isUser && 'border-bottom-right-radius: 4px;'}
  ${props => !props.isUser && 'border-bottom-left-radius: 4px;'}
`;

const MessageText = styled.div`
  h1, h2, h3, h4, h5, h6 {
    color: inherit;
    margin: 0 0 8px 0;
    font-size: 1.1em;
  }
  
  p {
    margin: 0 0 8px 0;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  ul, ol {
    margin: 8px 0;
    padding-left: 20px;
  }
  
  li {
    margin: 4px 0;
  }
  
  code {
    background: rgba(0, 0, 0, 0.2);
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'SF Mono', monospace;
    font-size: 0.9em;
  }
  
  pre {
    background: rgba(0, 0, 0, 0.2);
    padding: 12px;
    border-radius: 8px;
    overflow-x: auto;
    margin: 8px 0;
    
    code {
      background: none;
      padding: 0;
    }
  }
  
  blockquote {
    border-left: 3px solid #4a9eff;
    padding-left: 12px;
    margin: 8px 0;
    font-style: italic;
  }
`;

const ChatInput = styled.div`
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(26, 26, 26, 0.9);
`;

const InputContainer = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-end;
  max-width: 800px;
  margin: 0 auto;
`;

const MessageInput = styled.textarea`
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 12px 16px;
  color: #e0e0e0;
  font-size: 14px;
  font-family: inherit;
  resize: none;
  min-height: 44px;
  max-height: 120px;
  transition: all 0.2s ease;

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }

  &:focus {
    border-color: #4a9eff;
    background: rgba(255, 255, 255, 0.08);
    outline: none;
  }
`;

const SendButton = styled(motion.button)`
  background: linear-gradient(135deg, #4a9eff 0%, #357abd 100%);
  border: none;
  border-radius: 12px;
  padding: 12px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  min-width: 44px;
  height: 44px;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(74, 158, 255, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const WelcomeMessage = styled(motion.div)`
  text-align: center;
  padding: 40px 20px;
  color: rgba(255, 255, 255, 0.6);
`;

const WelcomeTitle = styled.h2`
  font-size: 28px;
  font-weight: 600;
  color: #e0e0e0;
  margin-bottom: 12px;
  font-family: 'Crimson Text', serif;
`;

const WelcomeText = styled.p`
  font-size: 16px;
  line-height: 1.6;
  max-width: 600px;
  margin: 0 auto;
`;

const ChatInterface = ({ sessionId }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadChatHistory();
  }, [sessionId]);

  const loadChatHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const history = await getChatHistory(sessionId);
      setMessages(history);
    } catch (error) {
      console.error('Failed to load chat history:', error);
      toast.error('Failed to load chat history');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await sendMessage({
        message: inputMessage.trim(),
        session_id: sessionId
      });

      const botMessage = {
        role: 'assistant',
        content: response.response,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = async () => {
    try {
      await clearChatHistory(sessionId);
      setMessages([]);
      toast.success('Chat history cleared');
    } catch (error) {
      console.error('Failed to clear chat:', error);
      toast.error('Failed to clear chat history');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isLoadingHistory) {
    return (
      <ChatContainer>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Loader className="animate-spin" size={32} />
        </div>
      </ChatContainer>
    );
  }

  return (
    <ChatContainer>
      <ChatHeader>
        <HeaderTitle>Consultation with Sherlock Holmes</HeaderTitle>
        <HeaderActions>
          <Button 
            variant="secondary" 
            onClick={loadChatHistory}
            style={{ padding: '8px 16px', fontSize: '12px' }}
          >
            <RefreshCw size={14} />
            Refresh
          </Button>
          <Button 
            variant="secondary" 
            onClick={handleClearChat}
            style={{ padding: '8px 16px', fontSize: '12px' }}
          >
            <Trash2 size={14} />
            Clear
          </Button>
        </HeaderActions>
      </ChatHeader>

      <ChatMessages>
        {messages.length === 0 && (
          <WelcomeMessage
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <WelcomeTitle>Welcome, my dear Watson</WelcomeTitle>
            <WelcomeText>
              I am Sherlock Holmes, and I am at your service. What mystery shall we unravel together? 
              Ask me about deduction, crime investigation, or any case that piques your curiosity.
            </WelcomeText>
          </WelcomeMessage>
        )}

        <AnimatePresence>
          {messages.map((message, index) => (
            <MessageContainer
              key={index}
              isUser={message.role === 'user'}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <MessageAvatar isUser={message.role === 'user'}>
                {message.role === 'user' ? <User size={20} /> : <Bot size={20} />}
              </MessageAvatar>
              <MessageContent isUser={message.role === 'user'}>
                <MessageText>
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </MessageText>
              </MessageContent>
            </MessageContainer>
          ))}
        </AnimatePresence>

        {isLoading && (
          <MessageContainer>
            <MessageAvatar>
              <Bot size={20} />
            </MessageAvatar>
            <MessageContent>
              <MessageText>
                <Loader className="animate-spin" size={16} style={{ display: 'inline-block', marginRight: '8px' }} />
                Sherlock is thinking...
              </MessageText>
            </MessageContent>
          </MessageContainer>
        )}

        <div ref={messagesEndRef} />
      </ChatMessages>

      <ChatInput>
        <InputContainer>
          <MessageInput
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask Sherlock Holmes anything..."
            disabled={isLoading}
          />
          <SendButton
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isLoading ? <Loader className="animate-spin" size={20} /> : <Send size={20} />}
          </SendButton>
        </InputContainer>
      </ChatInput>
    </ChatContainer>
  );
};

export default ChatInterface;
