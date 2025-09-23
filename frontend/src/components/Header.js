import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Menu, Search, User, Settings } from 'lucide-react';

const HeaderContainer = styled(motion.header)`
  background: rgba(26, 26, 26, 0.9);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0 20px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const Logo = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
`;

const LogoIcon = styled.div`
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #4a9eff 0%, #357abd 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
  color: white;
`;

const LogoText = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #e0e0e0;
  font-family: 'Crimson Text', serif;
`;

const MenuButton = styled(motion.button)`
  background: transparent;
  border: none;
  color: #e0e0e0;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const SearchButton = styled(MenuButton)`
  @media (max-width: 768px) {
    display: none;
  }
`;

const UserButton = styled(MenuButton)`
  @media (max-width: 768px) {
    display: none;
  }
`;

const Header = ({ onToggleSidebar }) => {
  return (
    <HeaderContainer
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <LeftSection>
        <MenuButton
          onClick={onToggleSidebar}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Menu size={20} />
        </MenuButton>
        
        <Logo
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <LogoIcon>🕵️</LogoIcon>
          <LogoText>Sherlock Holmes AI</LogoText>
        </Logo>
      </LeftSection>

      <RightSection>
        <SearchButton
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Search size={18} />
        </SearchButton>
        
        <UserButton
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <User size={18} />
        </UserButton>
        
        <MenuButton
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Settings size={18} />
        </MenuButton>
      </RightSection>
    </HeaderContainer>
  );
};

export default Header;
