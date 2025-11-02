import React from 'react';
import { VehicleModel } from '../../../types';
import { dataService } from '../../../services/dataService';
import SearchDropdown from './SearchDropdown';

interface VehicleModelSearchDropdownProps {
  value?: VehicleModel | null;
  onChange: (model: VehicleModel | null) => void;
  placeholder?: string;
  hasError?: boolean;
  disabled?: boolean;
}

const VehicleModelSearchDropdown: React.FC<VehicleModelSearchDropdownProps> = ({
  value,
  onChange,
  placeholder = "Search for vehicle model...",
  hasError = false,
  disabled = false
}) => {
  const handleSearch = async (searchTerm: string): Promise<VehicleModel[]> => {
    return await dataService.searchVehicleModels(searchTerm);
  };

  const displayValue = (model: VehicleModel): string => {
    return `${model.make} ${model.manufacturer} ${model.year}`;
  };

  const renderItem = (model: VehicleModel): React.ReactNode => {
    return (
      <div className="model-info">
        <div className="model-name">
          {model.make} {model.manufacturer}
        </div>
        <div className="model-details">
          Year: {model.year} | Capacity: {model.capacity}
        </div>
      </div>
    );
  };

  return (
    <SearchDropdown
      value={value}
      onChange={onChange}
      onSearch={handleSearch}
      displayValue={displayValue}
      renderItem={renderItem}
      placeholder={placeholder}
      hasError={hasError}
      disabled={disabled}
      noResultsMessage="No vehicle models found"
      searchPromptMessage="Start typing to search for vehicle models"
    />
  );
};

export default VehicleModelSearchDropdown;
