

import React from 'react';
import { Option } from '../types';

interface OptionSelectorProps {
  label: string;
  options: Option[] | { name: string; value?: string }[];
  value: string;
  onChange: (value: string) => void;
  // Fix: Changed from a restrictive union type to `string` to allow for more flexible key names. This resolves an error where "prompt" was used as a valueKey.
  valueKey?: string;
  // Fix: Changed from a restrictive union type to `string` for consistency and flexibility.
  labelKey?: string;
}

const OptionSelector: React.FC<OptionSelectorProps> = ({
  label,
  options,
  value,
  onChange,
  valueKey = 'value',
  labelKey = 'label'
}) => {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5 focus:ring-purple-500 focus:border-purple-500 transition"
      >
        {options.map((option, index) => (
          <option key={index} value={(option as any)[valueKey] ?? (option as any)[labelKey]}>
            {(option as any)[labelKey]}
          </option>
        ))}
      </select>
    </div>
  );
};

export default OptionSelector;