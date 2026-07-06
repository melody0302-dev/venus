import React, { useState } from 'react';
import { LucideIcon, AVAILABLE_ICONS } from './LucideIcon';

interface IconPickerProps {
  currentIcon: string;
  onSelectIcon: (iconName: string) => void;
  onClose?: () => void;
}

export function IconPicker({ currentIcon, onSelectIcon, onClose }: IconPickerProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredIcons = AVAILABLE_ICONS.filter(icon => 
    icon.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="absolute z-50 mt-1 w-64 bg-white border border-slate-200 rounded-lg shadow-xl p-3 text-slate-800">
      <div className="mb-2">
        <input
          type="text"
          placeholder="搜索图标..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-2 py-1 text-xs border border-slate-200 rounded focus:outline-none focus:border-blue-500"
          autoFocus
        />
      </div>
      
      <div className="grid grid-cols-6 gap-1 max-h-40 overflow-y-auto pr-1">
        {filteredIcons.map((iconName) => (
          <button
            key={iconName}
            type="button"
            title={iconName}
            onClick={() => {
              onSelectIcon(iconName);
              if (onClose) onClose();
            }}
            className={`p-1.5 rounded hover:bg-slate-100 flex items-center justify-center transition-colors ${
              currentIcon === iconName ? 'bg-blue-50 border border-blue-200 text-blue-600' : 'text-slate-500'
            }`}
          >
            <LucideIcon name={iconName} size={16} />
          </button>
        ))}
        {filteredIcons.length === 0 && (
          <div className="col-span-6 text-center py-4 text-xs text-slate-400">
            无匹配图标
          </div>
        )}
      </div>

      {onClose && (
        <div className="mt-2 pt-2 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="text-[10px] text-slate-500 hover:text-slate-700 font-medium"
          >
            关闭
          </button>
        </div>
      )}
    </div>
  );
}
