import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { VisualBuilder } from './components/VisualBuilder';
import { SidebarSection, PageContent } from './types';
import { DEFAULT_SIDEBAR_DATA, VENUS_STORAGE_TEMPLATE, TEMPLATES_LIST } from './data';
import { LucideIcon } from './components/LucideIcon';

export default function App() {
  // Load sidebar data from localStorage or fallback to default structure
  const [sections, setSections] = useState<SidebarSection[]>(() => {
    const saved = localStorage.getItem('venus_sidebar_sections');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Clean up AI Asset Management's non-header blocks for storage management as requested
        return parsed.map((sec: any) => ({
          ...sec,
          items: (sec.items || []).map((item: any) => {
            if (item.id === 'item-ai-assets' || item.name === 'AI资产管理') {
              return {
                ...item,
                content: {
                  ...item.content,
                  blocks: (item.content?.blocks || []).filter((b: any) => b.type === 'header')
                }
              };
            }
            return item;
          })
        }));
      } catch (e) {
        console.error('Failed to parse saved sections', e);
      }
    }
    return DEFAULT_SIDEBAR_DATA;
  });

  // Track active menu item ID
  const [activeItemId, setActiveItemId] = useState<string>(() => {
    // Default to the first item available or 'item-ai-assets'
    const savedActiveId = localStorage.getItem('venus_active_item_id');
    if (savedActiveId) return savedActiveId;
    
    // Fallback: try to find a default item
    for (const sec of DEFAULT_SIDEBAR_DATA) {
      if (sec.items.length > 0) {
        return sec.items[0].id;
      }
    }
    return 'item-ai-assets';
  });

  // Track global design mode
  const [isDesignMode, setIsDesignMode] = useState<boolean>(true);

  // Sync sidebar to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('venus_sidebar_sections', JSON.stringify(sections));
  }, [sections]);

  // Sync active item ID to localStorage
  useEffect(() => {
    localStorage.setItem('venus_active_item_id', activeItemId);
  }, [activeItemId]);

  // Find active item
  const findActiveItem = () => {
    for (const sec of sections) {
      const item = sec.items.find((i) => i.id === activeItemId);
      if (item) return { section: sec, item };
    }
    return null;
  };

  const activeData = findActiveItem();
  const activeItem = activeData?.item || null;
  const activeSection = activeData?.section || null;

  // Handle updating the current active page's blocks content
  const handleUpdateActiveContent = (newContent: PageContent) => {
    setSections((prevSections) =>
      prevSections.map((sec) => ({
        ...sec,
        items: sec.items.map((item) =>
          item.id === activeItemId ? { ...item, content: newContent } : item
        ),
      }))
    );
  };

  // Reset entire dashboard
  const handleResetAll = () => {
    setSections(DEFAULT_SIDEBAR_DATA);
    // Find the first default item
    for (const sec of DEFAULT_SIDEBAR_DATA) {
      if (sec.items.length > 0) {
        setActiveItemId(sec.items[0].id);
        break;
      }
    }
    setIsDesignMode(true);
    localStorage.removeItem('venus_sidebar_sections');
    localStorage.removeItem('venus_active_item_id');
  };

  // Load a full layout template onto the current active item
  const handleLoadTemplate = (templateId: string) => {
    const template = TEMPLATES_LIST.find((t) => t.id === templateId);
    if (template) {
      handleUpdateActiveContent(template.content);
    }
  };

  return (
    <div id="venus-workspace" className="w-full h-screen flex flex-col bg-slate-50/50 text-slate-800 font-sans overflow-hidden">
      
      {/* Top Header */}
      <Header
        isDesignMode={isDesignMode}
        onToggleDesignMode={setIsDesignMode}
        onResetAll={handleResetAll}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar Menu Editor */}
        <Sidebar
          sections={sections}
          activeItemId={activeItemId}
          onSelectItem={setActiveItemId}
          onUpdateSections={setSections}
        />

        {/* Right Active Content Designer */}
        <main id="main-content-canvas" className="flex-1 overflow-y-auto bg-[#F1F5F9] canvas-grid p-8 flex flex-col">
          {activeItem ? (
            <div className="flex-1 flex flex-col max-w-7xl w-full mx-auto space-y-6">
              
              {/* Top Banner showing what we are designing */}
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-4 mb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-brand-light text-brand rounded-lg border border-brand/10">
                    <LucideIcon name={activeItem.icon} size={16} />
                  </div>
                  <div>
                    <h1 className="text-base font-bold text-slate-800 tracking-tight">
                      {activeItem.name} 页面画布
                    </h1>
                    <p className="text-xs text-slate-400 mt-0.5">
                      所属分组: <span className="text-slate-600 font-semibold">{activeSection?.title || '（未分组菜单）'}</span>
                    </p>
                  </div>
                </div>
 
                {/* Designer Mode Label */}
                <div className="flex items-center gap-2">
                  {isDesignMode ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                      设计模式已开启
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                      看板预览模式
                    </span>
                  )}
                </div>
              </div>
 
              {/* Page Visual Builder & Canvas */}
              <div className="flex-1 bg-white border border-slate-200 rounded-lg p-6 shadow-sm min-h-[500px]">
                <VisualBuilder
                  content={activeItem.content || { blocks: [] }}
                  onChangeContent={handleUpdateActiveContent}
                  isDesignMode={isDesignMode}
                  menuItemName={activeItem.name}
                  onLoadTemplate={handleLoadTemplate}
                />
              </div>
 
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-white border border-slate-200 rounded-lg shadow-sm p-8 my-6 max-w-4xl mx-auto">
              <LucideIcon name="AlertTriangle" size={36} className="text-amber-500 mb-3" />
              <h3 className="text-base font-bold text-slate-700 mb-1">未选中有效菜单</h3>
              <p className="text-xs text-slate-500 mb-4">请在左侧导航栏点击或创建一个菜单，然后再进行页面设计。</p>
              <button
                onClick={handleResetAll}
                className="px-4 py-2 bg-brand hover:bg-brand-hover text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5"
              >
                <LucideIcon name="RotateCcw" size={13} />
                重置工作台数据
              </button>
            </div>
          )}
        </main>

      </div>
    </div>
  );
}
