import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { X, MessageSquare, BookOpen, Settings, History } from 'lucide-react';

const SidebarContainer = styled(motion.div)`
  width: 280px;
  background: rgba(26, 26, 26, 0.95);
  backdrop-filter: blur(10px);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  height: 100%;
  position: fixed;
  top: 60px;
  left: 0;
  z-index: 50;
`;

const SidebarHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SidebarTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #e0e0e0;
  margin: 0;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: #e0e0e0;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const SidebarContent = styled.div`
  flex: 1;
  padding: 20px;
`;

const MenuSection = styled.div`
  margin-bottom: 32px;
`;

const SectionTitle = styled.h3`
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.4);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 12px 0;
`;

const MenuItem = styled(motion.button)`
  width: 100%;
  background: transparent;
  border: none;
  color: #e0e0e0;
  padding: 12px 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  font-size: 14px;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  &.active {
    background: rgba(74, 158, 255, 0.1);
    color: #4a9eff;
  }
`;

const MenuIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const RecentChats = styled.div`
  margin-top: 20px;
`;

const ChatItem = styled(motion.button)`
  width: 100%;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  padding: 8px 16px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  font-size: 13px;
  margin-bottom: 4px;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    color: #e0e0e0;
  }
`;

const ChatPreview = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
`;

const Sidebar = ({ onClose }) => {
  const menuItems = [
    { icon: MessageSquare, label: 'New Chat', href: '/chat' },
    { icon: BookOpen, label: 'Cases Browser', href: '/cases' },
    { icon: History, label: 'Chat History', href: '/history' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ];

  const recentChats = [
    { id: 1, preview: 'What is your method of deduction?', time: '2 min ago' },
    { id: 2, preview: 'Tell me about the Hound of the Baskervilles', time: '1 hour ago' },
    { id: 3, preview: 'How do you analyze evidence?', time: 'Yesterday' },
  ];

  return (
    <SidebarContainer
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      exit={{ x: -280 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <SidebarHeader>
        <SidebarTitle>Menu</SidebarTitle>
        <CloseButton onClick={onClose}>
          <X size={18} />
        </CloseButton>
      </SidebarHeader>

      <SidebarContent>
        <MenuSection>
          <SectionTitle>Navigation</SectionTitle>
          {menuItems.map((item, index) => (
            <MenuItem
              key={index}
              whileHover={{ x: 4 }}
              transition={{ duration: 0.2 }}
            >
              <MenuIcon>
                <item.icon size={18} />
              </MenuIcon>
              {item.label}
            </MenuItem>
          ))}
        </MenuSection>

        <MenuSection>
          <SectionTitle>Recent Chats</SectionTitle>
          <RecentChats>
            {recentChats.map((chat) => (
              <ChatItem
                key={chat.id}
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <MenuIcon>
                  <MessageSquare size={14} />
                </MenuIcon>
                <ChatPreview>{chat.preview}</ChatPreview>
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                  {chat.time}
                </span>
              </ChatItem>
            ))}
          </RecentChats>
        </MenuSection>
      </SidebarContent>
    </SidebarContainer>
  );
};

export default Sidebar;
