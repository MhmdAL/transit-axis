import React, { useState, useEffect, useRef } from 'react';
import { FiSearch, FiChevronDown, FiX } from 'react-icons/fi';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const DropdownContainer = styled.div`
  position: relative;
  width: 100%;
`;

const DropdownInput = styled.input<{ hasError?: boolean; disabled?: boolean }>`
  width: 100%;
  padding: 12px 40px 12px 40px;
  border: 2px solid ${props => props.hasError ? '#e74c3c' : '#e1e8ed'};
  border-radius: 8px;
  font-size: 14px;
  background-color: ${props => props.disabled ? '#f8f9fa' : '#ffffff'};
  color: ${props => props.disabled ? '#6c757d' : '#2c3e50'};
  cursor: ${props => props.disabled ? 'not-allowed' : 'text'};
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.hasError ? '#e74c3c' : '#3498db'};
    box-shadow: 0 0 0 3px ${props => props.hasError ? 'rgba(231, 76, 60, 0.1)' : 'rgba(52, 152, 219, 0.1)'};
  }

  &::placeholder {
    color: #95a5a6;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #95a5a6;
  pointer-events: none;
`;

const ClearButton = styled.button`
  position: absolute;
  right: 40px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #95a5a6;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    background-color: #ecf0f1;
    color: #2c3e50;
  }
`;

const DropdownButton = styled.button<{ disabled?: boolean }>`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #95a5a6;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background-color: #ecf0f1;
    color: #2c3e50;
  }
`;

const DropdownList = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #ffffff;
  border: 2px solid #e1e8ed;
  border-top: none;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
`;

const DropdownItem = styled.div`
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid #f1f3f4;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #f8f9fa;
  }

  &:last-child {
    border-bottom: none;
  }

  .model-info, .user-info {
    .model-name, .user-name {
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 4px;
    }

    .model-details, .user-details {
      font-size: 12px;
      color: #7f8c8d;
    }
  }
`;

const LoadingSpinner = styled.div`
  padding: 20px;
  text-align: center;
  color: #7f8c8d;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid #e1e8ed;
    border-top: 2px solid #3498db;
    border-radius: 50%;
    animation: ${spin} 1s linear infinite;
  }
`;

const NoResultsMessage = styled.div`
  padding: 20px;
  text-align: center;
  color: #7f8c8d;
  font-style: italic;
`;

/**
 * Generic SearchDropdown Component
 * 
 * A reusable search dropdown that can work with any API and data type.
 * 
 * @example
 * // For searching users
 * <SearchDropdown
 *   value={selectedUser}
 *   onChange={setSelectedUser}
 *   onSearch={async (term) => await userService.searchUsers(term)}
 *   displayValue={(user) => `${user.firstName} ${user.lastName}`}
 *   renderItem={(user) => (
 *     <div>
 *       <div className="user-name">{user.firstName} {user.lastName}</div>
 *       <div className="user-email">{user.email}</div>
 *     </div>
 *   )}
 *   placeholder="Search for users..."
 * />
 * 
 * @example
 * // For searching products
 * <SearchDropdown
 *   value={selectedProduct}
 *   onChange={setSelectedProduct}
 *   onSearch={async (term) => await productService.searchProducts(term)}
 *   displayValue={(product) => product.name}
 *   renderItem={(product) => (
 *     <div>
 *       <div className="product-name">{product.name}</div>
 *       <div className="product-price">${product.price}</div>
 *     </div>
 *   )}
 *   placeholder="Search for products..."
 * />
 */
export interface SearchDropdownProps<T> {
  value?: T | null;
  onChange: (item: T | null) => void;
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
}

function SearchDropdown<T>({
  value,
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
  searchPromptMessage = "Start typing to search"
}: SearchDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [options, setOptions] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
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

  const handleOptionSelect = (item: T) => {
    onChange(item);
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange(null);
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

  const currentDisplayValue = value ? displayValue(value) : '';

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
      <SearchIcon>
        <FiSearch size={16} />
      </SearchIcon>
      
      {value && !isOpen && (
        <ClearButton onClick={handleClear} type="button">
          <FiX size={16} />
        </ClearButton>
      )}
      
      {!value && !isOpen && (
        <DropdownButton onClick={() => setIsOpen(true)} disabled={disabled}>
          <FiChevronDown size={16} />
        </DropdownButton>
      )}

      {isOpen && (
        <DropdownList>
          {isLoading ? (
            <LoadingSpinner>
              <div className="spinner" />
              Searching...
            </LoadingSpinner>
          ) : options.length > 0 ? (
            options.map((item, index) => (
              <DropdownItem
                key={index}
                onClick={() => handleOptionSelect(item)}
              >
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
    </DropdownContainer>
  );
}

export default SearchDropdown;
