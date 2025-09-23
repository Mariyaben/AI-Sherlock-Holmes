import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Search, BookOpen, FileText, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

import { getCases, getCaseContent, searchCases } from '../services/api';
import { Input, Button } from '../styles/GlobalStyles';

const CasesContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 60px);
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
`;

const CasesHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const HeaderTitle = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: #e0e0e0;
  font-family: 'Crimson Text', serif;
  margin: 0 0 16px 0;
`;

const SearchContainer = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const SearchInput = styled(Input)`
  flex: 1;
  max-width: 400px;
`;

const SearchButton = styled(Button)`
  padding: 12px 20px;
`;

const CasesContent = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
`;

const CasesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
`;

const CaseCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(74, 158, 255, 0.3);
    transform: translateY(-2px);
  }
`;

const CaseIcon = styled.div`
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
`;

const CaseTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #e0e0e0;
  margin: 0 0 8px 0;
  font-family: 'Crimson Text', serif;
`;

const CaseDescription = styled.p`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0 0 12px 0;
  line-height: 1.5;
`;

const CaseMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const SelectedCase = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 24px;
  margin-top: 20px;
`;

const SelectedCaseHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const SelectedCaseTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #e0e0e0;
  margin: 0;
  font-family: 'Crimson Text', serif;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #e0e0e0;
  }
`;

const CaseContent = styled.div`
  max-height: 400px;
  overflow-y: auto;
  font-size: 14px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.8);

  h1, h2, h3, h4, h5, h6 {
    color: #e0e0e0;
    margin: 16px 0 8px 0;
  }

  p {
    margin: 0 0 12px 0;
  }

  code {
    background: rgba(0, 0, 0, 0.3);
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'SF Mono', monospace;
  }
`;

const LoadingState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: rgba(255, 255, 255, 0.6);
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: rgba(255, 255, 255, 0.6);
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

const EmptyTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #e0e0e0;
  margin: 0 0 8px 0;
`;

const EmptyText = styled.p`
  font-size: 14px;
  margin: 0;
`;

const CasesBrowser = () => {
  const [cases, setCases] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCase, setSelectedCase] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    try {
      setIsLoading(true);
      const response = await getCases();
      setCases(response.cases || []);
    } catch (error) {
      console.error('Failed to load cases:', error);
      toast.error('Failed to load cases');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadCases();
      return;
    }

    try {
      setIsSearching(true);
      const response = await searchCases(searchQuery);
      // Convert search results to case format for display
      const searchResults = response.results.map((result, index) => ({
        filename: `search_result_${index}.txt`,
        title: `Search Result: ${searchQuery}`,
        content: result
      }));
      setCases(searchResults);
    } catch (error) {
      console.error('Failed to search cases:', error);
      toast.error('Failed to search cases');
    } finally {
      setIsSearching(false);
    }
  };

  const handleCaseSelect = async (caseItem) => {
    try {
      const response = await getCaseContent(caseItem.filename);
      setSelectedCase({
        ...caseItem,
        content: response.content,
        fullLength: response.full_length
      });
    } catch (error) {
      console.error('Failed to load case content:', error);
      toast.error('Failed to load case content');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearSelection = () => {
    setSelectedCase(null);
  };

  if (isLoading) {
    return (
      <CasesContainer>
        <CasesHeader>
          <HeaderTitle>Sherlock Holmes Cases</HeaderTitle>
        </CasesHeader>
        <LoadingState>
          <BookOpen size={32} className="animate-spin" />
        </LoadingState>
      </CasesContainer>
    );
  }

  return (
    <CasesContainer>
      <CasesHeader>
        <HeaderTitle>Sherlock Holmes Cases</HeaderTitle>
        <SearchContainer>
          <SearchInput
            type="text"
            placeholder="Search through cases..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <SearchButton onClick={handleSearch} disabled={isSearching}>
            <Search size={16} />
            {isSearching ? 'Searching...' : 'Search'}
          </SearchButton>
        </SearchContainer>
      </CasesHeader>

      <CasesContent>
        {cases.length === 0 ? (
          <EmptyState>
            <EmptyIcon>📚</EmptyIcon>
            <EmptyTitle>No cases found</EmptyTitle>
            <EmptyText>
              {searchQuery ? 'Try adjusting your search terms' : 'No cases available'}
            </EmptyText>
          </EmptyState>
        ) : (
          <>
            <CasesGrid>
              {cases.map((caseItem, index) => (
                <CaseCard
                  key={index}
                  onClick={() => handleCaseSelect(caseItem)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <CaseIcon>
                    <FileText size={24} />
                  </CaseIcon>
                  <CaseTitle>{caseItem.title}</CaseTitle>
                  <CaseDescription>
                    {caseItem.filename.replace('.txt', '').replace(/_/g, ' ')}
                  </CaseDescription>
                  <CaseMeta>
                    <MetaItem>
                      <BookOpen size={12} />
                      Case File
                    </MetaItem>
                    <MetaItem>
                      <Clock size={12} />
                      Available
                    </MetaItem>
                  </CaseMeta>
                </CaseCard>
              ))}
            </CasesGrid>

            {selectedCase && (
              <SelectedCase
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <SelectedCaseHeader>
                  <SelectedCaseTitle>{selectedCase.title}</SelectedCaseTitle>
                  <CloseButton onClick={clearSelection}>
                    ×
                  </CloseButton>
                </SelectedCaseHeader>
                <CaseContent>
                  {selectedCase.content}
                </CaseContent>
              </SelectedCase>
            )}
          </>
        )}
      </CasesContent>
    </CasesContainer>
  );
};

export default CasesBrowser;
