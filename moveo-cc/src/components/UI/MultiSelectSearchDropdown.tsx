import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '../../styles/theme';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const DropdownContainer = styled.div`
  position: relative;
  width: 100%;
  min-height: 48px;
`;

const DropdownInput = styled.input<{ hasError?: boolean; disabled?: boolean }>`
  width: 100%;
  padding: 12px 40px 12px 40px;
  border: 2px solid ${props => props.hasError ? '#e74c3c' : theme.colors.border};
  border-radius: 8px;
  font-size: 14px;
  background-color: ${props => props.disabled ? theme.colors.surfaceHover : theme.colors.card};
  color: ${props => props.disabled ? theme.colors.textMuted : theme.colors.textPrimary};
  cursor: ${props => props.disabled ? 'not-allowed' : 'text'};
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.hasError ? '#e74c3c' : theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.hasError ? 'rgba(231, 76, 60, 0.1)' : 'rgba(52, 152, 219, 0.1)'};
  }

  &::placeholder {
    color: ${theme.colors.textMuted};
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: ${theme.colors.textMuted};
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
`;

const ClearButton = styled.button`
  position: absolute;
  right: 40px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: ${theme.colors.textMuted};
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: ${theme.colors.surfaceHover};
    color: ${theme.colors.textPrimary};
  }
`;

const DropdownButton = styled.button<{ disabled?: boolean }>`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: ${theme.colors.textMuted};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  padding: 6px;
  border-radius: 4px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;

  &:hover:not(:disabled) {
    background-color: ${theme.colors.surfaceHover};
    color: ${theme.colors.textPrimary};
  }
`;

const DropdownList = styled.div`
  position: absolute;
  top: calc(100% + 2px);
  left: 0;
  right: 0;
  background: ${theme.colors.card};
  border: 2px solid ${theme.colors.border};
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-height: 200px;
  overflow-y: auto;
  z-index: 1001;
`;

const DropdownItem = styled.div<{ selected?: boolean }>`
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid ${theme.colors.border};
  background: ${props => props.selected ? theme.colors.surfaceHover : 'transparent'};
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${theme.colors.surfaceHover};
  }

  &:last-child {
    border-bottom: none;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: ${theme.colors.textMuted};

  .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid ${theme.colors.border};
    border-top: 2px solid ${theme.colors.primary};
    border-radius: 50%;
    animation: ${spin} 1s linear infinite;
    margin-right: 8px;
  }
`;

const NoResultsMessage = styled.div`
  padding: 20px;
  text-align: center;
  color: ${theme.colors.textMuted};
  font-style: italic;
`;

const SelectedItemsToggle = styled.button`
  position: absolute;
  right: 70px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: ${theme.colors.textMuted};
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  
  &:hover {
    background-color: ${theme.colors.surfaceHover};
    color: ${theme.colors.textPrimary};
  }
`;

const SelectedCountBadge = styled.div`
  position: absolute;
  top: -8px;
  right: 62px;
  background: ${theme.colors.primary};
  color: white;
  border-radius: 10px;
  padding: 2px 6px;
  font-size: 10px;
  font-weight: 600;
  min-width: 18px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const SelectedItemsPanel = styled.div<{ isVisible: boolean }>`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: ${props => props.isVisible ? theme.colors.card : 'transparent'};
  border: ${props => props.isVisible ? `2px solid ${theme.colors.border}` : 'none'};
  border-top: none;
  border-radius: ${props => props.isVisible ? '0 0 8px 8px' : '0'};
  box-shadow: ${props => props.isVisible ? '0 4px 12px rgba(0, 0, 0, 0.1)' : 'none'};
  z-index: 999;
  max-height: ${props => props.isVisible ? '200px' : '0'};
  overflow: hidden;
  transition: all 0.3s ease;
  padding: ${props => props.isVisible ? '12px' : '0'};
`;

const SelectedItemsGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  max-height: 180px;
  overflow-y: auto;
`;

const SelectedItemCard = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primaryHover});
  color: white;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
`;

const RemoveItemButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  cursor: pointer;
  padding: 2px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  transition: all 0.2s ease;
  font-size: 12px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
  }
`;

const Checkbox = styled.input`
  margin-right: 8px;
  accent-color: ${theme.colors.primary};
  cursor: pointer;
`;

export interface MultiSelectSearchDropdownProps<T> {
  values: T[];
  onChange: (items: T[]) => void;
  onSearch: (searchTerm: string) => Promise<T[]>;
  displayValue: (item: T) => string;
  renderItem: (item: T) => React.ReactNode;
  placeholder?: string;
  hasError?: boolean;
  disabled?: boolean;
  debounceMs?: number;
  minSearchLength?: number;
  noResultsMessage?: string;
  searchPromptMessage?: string;
  maxHeight?: string;
}

function MultiSelectSearchDropdown<T>({
  values,
  onChange,
  onSearch,
  displayValue,
  renderItem,
  placeholder = "Search...",
  hasError = false,
  disabled = false,
  debounceMs = 300,
  minSearchLength = 1,
  noResultsMessage = "No results found",
  searchPromptMessage = "Start typing to search",
  maxHeight = "200px"
}: MultiSelectSearchDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [options, setOptions] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showSelectedItems, setShowSelectedItems] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search with debouncing
  useEffect(() => {
    if (!searchTerm.trim() || searchTerm.length < minSearchLength) {
      setOptions([]);
      setHasSearched(false);
      return;
    }

    const searchTimeout = setTimeout(async () => {
      setIsLoading(true);
      try {
        const results = await onSearch(searchTerm);
        setOptions(results);
        setHasSearched(true);
      } catch (error) {
        console.error('Error searching:', error);
        setOptions([]);
      } finally {
        setIsLoading(false);
      }
    }, debounceMs);

    return () => clearTimeout(searchTimeout);
  }, [searchTerm, onSearch, debounceMs, minSearchLength]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  const handleOptionToggle = (item: T) => {
    const isSelected = values.some(value => JSON.stringify(value) === JSON.stringify(item));
    
    if (isSelected) {
      onChange(values.filter(value => JSON.stringify(value) !== JSON.stringify(item)));
    } else {
      onChange([...values, item]);
    }
  };

  const handleRemoveItem = (itemToRemove: T) => {
    onChange(values.filter(item => JSON.stringify(item) !== JSON.stringify(itemToRemove)));
  };

  const handleClear = () => {
    onChange([]);
    setSearchTerm('');
    setOptions([]);
    setHasSearched(false);
    setIsOpen(false);
  };

  const handleInputFocus = () => {
    if (!disabled) {
      setIsOpen(true);
    }
  };

  const isItemSelected = (item: T) => {
    return values.some(value => JSON.stringify(value) === JSON.stringify(item));
  };

  const currentDisplayValue = values.length > 0 
    ? `${values.length} item${values.length > 1 ? 's' : ''} selected`
    : '';

  return (
    <DropdownContainer ref={dropdownRef}>
      <DropdownInput
        ref={inputRef}
        type="text"
        value={isOpen ? searchTerm : currentDisplayValue}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        placeholder={placeholder}
        hasError={hasError}
        disabled={disabled}
      />
      <SearchIcon>🔍</SearchIcon>
      
      {values.length > 0 && !isOpen && (
        <>
          <SelectedItemsToggle onClick={() => setShowSelectedItems(!showSelectedItems)}>
            {showSelectedItems ? '👁️‍🗨️' : '👁️'}
          </SelectedItemsToggle>
          <SelectedCountBadge>{values.length}</SelectedCountBadge>
          <ClearButton onClick={handleClear} type="button">
            ✕
          </ClearButton>
        </>
      )}
      
      {values.length === 0 && !isOpen && (
        <DropdownButton onClick={() => setIsOpen(true)} disabled={disabled}>
          ▼
        </DropdownButton>
      )}

      {isOpen && (
        <DropdownList style={{ maxHeight }}>
          {isLoading ? (
            <LoadingSpinner>
              <div className="spinner" />
              Searching...
            </LoadingSpinner>
          ) : options.length > 0 ? (
            options.map((item, index) => (
              <DropdownItem
                key={index}
                onClick={() => handleOptionToggle(item)}
                selected={isItemSelected(item)}
              >
                <Checkbox
                  type="checkbox"
                  checked={isItemSelected(item)}
                  onChange={() => handleOptionToggle(item)}
                />
                {renderItem(item)}
              </DropdownItem>
            ))
          ) : hasSearched ? (
            <NoResultsMessage>
              {noResultsMessage}
            </NoResultsMessage>
          ) : (
            <NoResultsMessage>
              {searchPromptMessage}
            </NoResultsMessage>
          )}
        </DropdownList>
      )}

      {values.length > 0 && !isOpen && (
        <SelectedItemsPanel isVisible={showSelectedItems}>
          <SelectedItemsGrid>
            {values.map((item, index) => (
              <SelectedItemCard key={index}>
                <span>{displayValue(item)}</span>
                <RemoveItemButton onClick={() => handleRemoveItem(item)}>
                  ✕
                </RemoveItemButton>
              </SelectedItemCard>
            ))}
          </SelectedItemsGrid>
        </SelectedItemsPanel>
      )}
    </DropdownContainer>
  );
}

export default MultiSelectSearchDropdown;

