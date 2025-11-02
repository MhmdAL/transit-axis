import React from 'react';
import { VehicleModel } from '../../types';
import {
  VehicleModelDisplay,
  VehicleModelName,
  VehicleModelDetails,
  VehicleModelBadge,
  VehicleModelCompact,
  VehicleModelText,
  VehicleModelSeparator
} from './CommonStyles';

interface VehicleModelDisplayExamplesProps {
  model: VehicleModel;
}

const VehicleModelDisplayExamples: React.FC<VehicleModelDisplayExamplesProps> = ({ model }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '20px' }}>
      <h3>Vehicle Model Display Options</h3>
      
      {/* Option 1: Hierarchical Display (Current Implementation) */}
      <div>
        <h4>Option 1: Hierarchical Display</h4>
        <VehicleModelDisplay>
          <VehicleModelName>
            {model.make} {model.manufacturer}
          </VehicleModelName>
          <VehicleModelDetails>
            <VehicleModelBadge>{model.year}</VehicleModelBadge>
            <VehicleModelBadge>{model.capacity} seats</VehicleModelBadge>
          </VehicleModelDetails>
        </VehicleModelDisplay>
      </div>

      {/* Option 2: Compact Inline Display */}
      <div>
        <h4>Option 2: Compact Inline Display</h4>
        <VehicleModelCompact>
          <VehicleModelText>{model.make}</VehicleModelText>
          <VehicleModelSeparator>•</VehicleModelSeparator>
          <VehicleModelText>{model.manufacturer}</VehicleModelText>
          <VehicleModelSeparator>•</VehicleModelSeparator>
          <VehicleModelText>{model.year}</VehicleModelText>
          <VehicleModelSeparator>•</VehicleModelSeparator>
          <VehicleModelText>{model.capacity} seats</VehicleModelText>
        </VehicleModelCompact>
      </div>

      {/* Option 3: Simple Text Display */}
      <div>
        <h4>Option 3: Simple Text Display</h4>
        <div style={{ fontSize: '14px', color: '#2c3e50' }}>
          {model.make} {model.manufacturer} {model.year} ({model.capacity} seats)
        </div>
      </div>

      {/* Option 4: Badge-Only Display */}
      <div>
        <h4>Option 4: Badge-Only Display</h4>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <VehicleModelBadge>{model.make}</VehicleModelBadge>
          <VehicleModelBadge>{model.manufacturer}</VehicleModelBadge>
          <VehicleModelBadge>{model.year}</VehicleModelBadge>
          <VehicleModelBadge>{model.capacity} seats</VehicleModelBadge>
        </div>
      </div>

      {/* Option 5: Two-Line Display */}
      <div>
        <h4>Option 5: Two-Line Display</h4>
        <div style={{ fontSize: '14px', lineHeight: '1.4' }}>
          <div style={{ fontWeight: '600', color: '#2c3e50' }}>
            {model.make} {model.manufacturer}
          </div>
          <div style={{ fontSize: '12px', color: '#7f8c8d' }}>
            {model.year} • {model.capacity} seats
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleModelDisplayExamples;
