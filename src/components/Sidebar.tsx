import React, { useState } from 'react';
import { SidebarSection, SidebarItem } from '../types';
import { LucideIcon } from './LucideIcon';
import { IconPicker } from './IconPicker';
import { createEmptyContent } from '../data';

interface SidebarProps {
  sections: SidebarSection[];
  activeItemId: string;
  onSelectItem: (itemId: string) => void;
  onUpdateSections: (newSections: SidebarSection[]) => void;
}

export function Sidebar({
  sections,
  activeItemId,
  onSelectItem,
  onUpdateSections
}: SidebarProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [activeIconPickerId, setActiveIconPickerId] = useState<string | null>(null);

  // Reorder sections
  const moveSection = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === sections.length - 1) return;

    const newSections = [...sections];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const temp = newSections[index];
    newSections[index] = newSections[targetIdx];
    newSections[targetIdx] = temp;
    onUpdateSections(newSections);
  };

  // Reorder items within a section
  const moveItem = (sectionIdx: number, itemIdx: number, direction: 'up' | 'down') => {
    const section = sections[sectionIdx];
    const items = [...section.items];

    if (direction === 'up' && itemIdx === 0) return;
    if (direction === 'down' && itemIdx === items.length - 1) return;

    const targetIdx = direction === 'up' ? itemIdx - 1 : itemIdx + 1;
    const temp = items[itemIdx];
    items[itemIdx] = items[targetIdx];
    items[targetIdx] = temp;

    const newSections = [...sections];
    newSections[sectionIdx] = { ...section, items };
    onUpdateSections(newSections);
  };

  // Add new section
  const addSection = () => {
    const newSec: SidebarSection = {
      id: `sec-${Math.random().toString(36).substring(2, 9)}`,
      title: '新资源群组',
      items: []
    };
    onUpdateSections([...sections, newSec]);
  };

  // Delete section
  const deleteSection = (sectionId: string) => {
    if (confirm('确定要删除这个分组及其全部菜单吗？')) {
      onUpdateSections(sections.filter(s => s.id !== sectionId));
    }
  };

  // Update section title
  const updateSectionTitle = (sectionId: string, title: string) => {
    onUpdateSections(
      sections.map(s => s.id === sectionId ? { ...s, title } : s)
    );
  };

  // Add new item to a section
  const addItemToSection = (sectionId: string) => {
    const newItem: SidebarItem = {
      id: `item-${Math.random().toString(36).substring(2, 9)}`,
      name: '新导航菜单',
      icon: 'List',
      content: createEmptyContent()
    };

    onUpdateSections(
      sections.map(s => {
        if (s.id === sectionId) {
          return { ...s, items: [...s.items, newItem] };
        }
        return s;
      })
    );

    // Auto select the newly added item
    onSelectItem(newItem.id);
  };

  // Delete menu item
  const deleteItem = (sectionId: string, itemId: string) => {
    onUpdateSections(
      sections.map(s => {
        if (s.id === sectionId) {
          return { ...s, items: s.items.filter(item => item.id !== itemId) };
        }
        return s;
      })
    );
  };

  // Update menu item parameters
  const updateItemDetails = (sectionId: string, itemId: string, name: string) => {
    onUpdateSections(
      sections.map(s => {
        if (s.id === sectionId) {
          return {
            ...s,
            items: s.items.map(item => item.id === itemId ? { ...item, name } : item)
          };
        }
        return s;
      })
    );
  };

  const updateItemIcon = (sectionId: string, itemId: string, icon: string) => {
    onUpdateSections(
      sections.map(s => {
        if (s.id === sectionId) {
          return {
            ...s,
            items: s.items.map(item => item.id === itemId ? { ...item, icon } : item)
          };
        }
        return s;
      })
    );
    setActiveIconPickerId(null);
  };

  return (
    <div id="left-sidebar" className="w-[260px] flex-shrink-0 border-r border-slate-200 bg-white flex flex-col h-full overflow-hidden select-none">
      
      {/* Sidebar Editor Mode Switch */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-brand rounded-[3px] shadow-sm"></div>
          <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">
            Venus Workspace
          </span>
        </div>
        <button
          onClick={() => setIsEditMode(!isEditMode)}
          className={`px-2.5 py-1 text-[11px] font-bold rounded transition-all cursor-pointer ${
            isEditMode
              ? 'bg-brand text-white shadow-sm hover:bg-brand-hover'
              : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
          }`}
        >
          {isEditMode ? '完成' : '编辑'}
        </button>
      </div>

      {/* Menu List Container */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
        {sections.map((section, sIdx) => {
          const isSectionEditing = editingSectionId === section.id;

          return (
            <div key={section.id} className="px-3 space-y-1">
              
              {/* SECTION HEADER */}
              <div className="group flex items-center justify-between px-3 py-1.5 min-h-[28px]">
                {isEditMode ? (
                  isSectionEditing ? (
                    <input
                      type="text"
                      value={section.title}
                      onChange={(e) => updateSectionTitle(section.id, e.target.value)}
                      onBlur={() => setEditingSectionId(null)}
                      onKeyDown={(e) => e.key === 'Enter' && setEditingSectionId(null)}
                      className="text-xs font-semibold text-slate-700 border-b border-brand focus:outline-none bg-transparent w-full"
                      autoFocus
                    />
                  ) : (
                    <div className="flex items-center justify-between w-full">
                      <span
                        onClick={() => setEditingSectionId(section.id)}
                        className="text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer border-b border-transparent hover:border-dashed hover:border-slate-400"
                        title="点击重命名分组"
                      >
                        {section.title || '(无标题组)'}
                      </span>
                      <div className="flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => moveSection(sIdx, 'up')}
                          disabled={sIdx === 0}
                          className="p-0.5 hover:bg-slate-150 rounded text-slate-400 disabled:opacity-20 cursor-pointer"
                          title="上移分组"
                        >
                          <LucideIcon name="ArrowUp" size={10} />
                        </button>
                        <button
                          onClick={() => moveSection(sIdx, 'down')}
                          disabled={sIdx === sections.length - 1}
                          className="p-0.5 hover:bg-slate-150 rounded text-slate-400 disabled:opacity-20 cursor-pointer"
                          title="下移分组"
                        >
                          <LucideIcon name="ArrowDown" size={10} />
                        </button>
                        <button
                          onClick={() => deleteSection(section.id)}
                          className="p-0.5 hover:bg-red-50 hover:text-red-500 rounded text-slate-400 cursor-pointer"
                          title="删除分组"
                        >
                          <LucideIcon name="Trash" size={10} />
                        </button>
                      </div>
                    </div>
                  )
                ) : (
                  section.title && (
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      {section.title}
                    </span>
                  )
                )}
              </div>

              {/* SECTION MENU ITEMS */}
              <div className="space-y-1.5">
                {section.items.map((item, iIdx) => {
                  const isActive = item.id === activeItemId;
                  const isItemEditing = editingItemId === item.id;
                  const isPickerActive = activeIconPickerId === item.id;

                  return (
                    <div key={item.id} className="relative group">
                      {isEditMode ? (
                        <div className="flex items-center justify-between px-3 py-1.5 w-full text-xs border-2 border-dashed border-slate-200 rounded-lg bg-slate-50/70 text-slate-500 hover:bg-slate-50 hover:border-slate-300 transition-all min-h-[44px]">
                          {/* Left: Icon Selector & Name Input */}
                          <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
                            {/* Icon Picker Popover */}
                            <div className="relative">
                              <button
                                type="button"
                                onClick={() => setActiveIconPickerId(isPickerActive ? null : item.id)}
                                className="p-1 border border-slate-200 rounded bg-white hover:border-brand hover:text-brand text-slate-500 transition-colors flex items-center justify-center cursor-pointer"
                                title="修改图标"
                              >
                                <LucideIcon name={item.icon} size={14} />
                              </button>
                              
                              {isPickerActive && (
                                <IconPicker
                                  currentIcon={item.icon}
                                  onSelectIcon={(iconName) => updateItemIcon(section.id, item.id, iconName)}
                                  onClose={() => setActiveIconPickerId(null)}
                                />
                              )}
                            </div>

                            {isItemEditing ? (
                              <input
                                type="text"
                                value={item.name}
                                onChange={(e) => updateItemDetails(section.id, item.id, e.target.value)}
                                onBlur={() => setEditingItemId(null)}
                                onKeyDown={(e) => e.key === 'Enter' && setEditingItemId(null)}
                                className="border-b border-brand focus:outline-none bg-transparent py-0.5 w-full text-slate-800 font-semibold"
                                autoFocus
                              />
                            ) : (
                              <span
                                onClick={() => setEditingItemId(item.id)}
                                className="font-semibold truncate text-slate-700 hover:text-brand border-b border-transparent hover:border-dashed hover:border-slate-400 cursor-pointer py-0.5 flex-1"
                                title="点击重命名菜单"
                              >
                                {item.name}
                              </span>
                            )}
                          </div>

                          {/* Right: sorting and delete actions */}
                          <div className="flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => moveItem(sIdx, iIdx, 'up')}
                              disabled={iIdx === 0}
                              className="p-0.5 hover:bg-white rounded border border-transparent hover:border-slate-200 text-slate-400 disabled:opacity-20 cursor-pointer"
                              title="上移菜单"
                            >
                              <LucideIcon name="ArrowUp" size={10} />
                            </button>
                            <button
                              onClick={() => moveItem(sIdx, iIdx, 'down')}
                              disabled={iIdx === section.items.length - 1}
                              className="p-0.5 hover:bg-white rounded border border-transparent hover:border-slate-200 text-slate-400 disabled:opacity-20 cursor-pointer"
                              title="下移菜单"
                            >
                              <LucideIcon name="ArrowDown" size={10} />
                            </button>
                            <button
                              onClick={() => deleteItem(section.id, item.id)}
                              className="p-0.5 hover:bg-red-50 hover:text-red-500 rounded text-slate-400 cursor-pointer"
                              title="删除菜单"
                            >
                              <LucideIcon name="Trash" size={10} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        // Normal View Mode Link - Styled as Geometric Balance active/inactive item
                        <button
                          onClick={() => onSelectItem(item.id)}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg text-left cursor-pointer transition-all border ${
                            isActive
                              ? 'bg-brand-light border-brand text-brand font-bold shadow-[0_1px_2px_rgba(99,102,241,0.05)]'
                              : 'bg-transparent border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-semibold'
                          }`}
                        >
                          <LucideIcon
                            name={item.icon}
                            className={`transition-colors ${
                              isActive ? 'text-brand' : 'text-slate-400 group-hover:text-slate-600'
                            }`}
                            size={14}
                          />
                          <span className="truncate">{item.name}</span>
                        </button>
                      )}
                    </div>
                  );
                })}

                {/* Inline "Add Item" inside section */}
                {isEditMode && (
                  <button
                    onClick={() => addItemToSection(section.id)}
                    className="w-full py-2 px-3 border border-dashed border-slate-200 hover:border-brand rounded-lg hover:text-brand text-slate-500 hover:bg-brand-light/30 text-left text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer mt-1.5"
                  >
                    <LucideIcon name="Plus" size={13} />
                    添加新菜单
                  </button>
                )}
              </div>

              {/* Sub-group separator if there's no title for the next group */}
              {!isEditMode && section.items.length > 0 && sIdx < sections.length - 1 && !sections[sIdx + 1].title && (
                <div className="py-2">
                  <div className="border-t border-slate-100"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* "Add Section" Bottom Action */}
      {isEditMode ? (
        <div className="p-3 border-t border-slate-100 bg-slate-50">
          <button
            onClick={addSection}
            className="w-full py-2 bg-white border border-slate-200 hover:border-brand text-slate-700 text-xs font-bold rounded-lg hover:text-brand transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
          >
            <LucideIcon name="PlusCircle" size={14} className="text-brand" />
            新建分组 (Section)
          </button>
        </div>
      ) : (
        /* Geometric Balance Bottom Status Card */
        <div className="p-4 m-3 bg-slate-50 border border-slate-200 rounded-lg">
          <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
            Structure Mode
          </div>
          <div className="text-xs font-bold text-slate-700 mt-1.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-brand rounded-[2px] animate-pulse"></span>
            Sidebar Editable
          </div>
        </div>
      )}
    </div>
  );
}
