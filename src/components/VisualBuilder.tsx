import React, { useState } from 'react';
import { PageBlock, PageContent } from '../types';
import { LucideIcon } from './LucideIcon';
import { motion } from 'motion/react';
import { CredentialsManager } from './CredentialsManager';

interface VisualBuilderProps {
  content: PageContent;
  onChangeContent: (newContent: PageContent) => void;
  isDesignMode: boolean;
  menuItemName: string;
  onLoadTemplate: (templateId: string) => void;
}

export function VisualBuilder({
  content,
  onChangeContent,
  isDesignMode,
  menuItemName,
  onLoadTemplate
}: VisualBuilderProps) {
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);

  const blocks = content.blocks || [];
  const headerBlock = blocks.find((b) => b.type === 'header');
  const activeTab = headerBlock?.config?.activeTab || '存储管理';

  const updateBlockConfig = (blockId: string, newConfig: any) => {
    const updatedBlocks = blocks.map((b) =>
      b.id === blockId ? { ...b, config: { ...b.config, ...newConfig } } : b
    );
    onChangeContent({ blocks: updatedBlocks });
  };

  const deleteBlock = (blockId: string) => {
    const updatedBlocks = blocks.filter((b) => b.id !== blockId);
    onChangeContent({ blocks: updatedBlocks });
    if (editingBlockId === blockId) {
      setEditingBlockId(null);
    }
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === blocks.length - 1) return;

    const newBlocks = [...blocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[targetIndex];
    newBlocks[targetIndex] = temp;

    onChangeContent({ blocks: newBlocks });
  };

  const addBlock = (type: PageBlock['type']) => {
    const id = `block-${type}-${Math.random().toString(36).substring(2, 9)}`;
    let defaultConfig = {};

    switch (type) {
      case 'header':
        defaultConfig = {
          title: menuItemName,
          tabs: ['模型仓库', '数据集', '镜像仓库', '存储管理', '第三方凭证管理'],
          activeTab: '存储管理'
        };
        break;
      case 'filter-bar':
        defaultConfig = {
          title: '存储管理',
          tenantLabel: '请选择租户',
          tenantPlaceholder: '请选择租户',
          searchPlaceholder: '请输入检索关键字',
          buttonText: '新增项'
        };
        break;
      case 'data-table':
        defaultConfig = {
          columns: [
            { header: '名称', key: 'name' },
            { header: '类型', key: 'type' },
            { header: '容量', key: 'capacity' },
            { header: '状态', key: 'status' },
            { header: '操作', key: 'actions' }
          ],
          rows: [
            { id: 'row-1', name: 'demo-pvc', type: 'nfs-client', capacity: '10 Gi', status: 'Bound' }
          ]
        };
        break;
      case 'stat-cards':
        defaultConfig = {
          cards: [
            { label: '总资源量', value: '1,200 Gi', trend: '稳定', color: 'blue' },
            { label: '使用中', value: '840 Gi', trend: '上升 5%', color: 'indigo' }
          ]
        };
        break;
      case 'sandbox':
        defaultConfig = {
          htmlContent: `
<div class="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-5">
  <h3 class="text-sm font-semibold text-blue-900 mb-1">💡 自定义看板模块</h3>
  <p class="text-xs text-blue-700">这是一个自由设计沙盒！您可以在右侧配置中直接修改这段 HTML，用来设计您需要的任何 UI 卡片或内容。</p>
</div>
          `
        };
        break;
    }

    const newBlock: PageBlock = { id, type, config: defaultConfig };
    onChangeContent({ blocks: [...blocks, newBlock] });
    setEditingBlockId(id); // Open edit panel automatically
  };

  return (
    <div className="w-full h-full min-h-[500px]">
      {/* Empty State Selector */}
      {blocks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-6 bg-[#F8FAFC]/50 border border-dashed border-slate-200 rounded-lg max-w-4xl mx-auto my-10">
          <div className="w-12 h-12 bg-brand-light rounded-full flex items-center justify-center text-brand mb-4 shadow-sm border border-brand/10">
            <LucideIcon name="Grid" size={24} />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">页面暂无内容</h3>
          <p className="text-xs text-slate-500 text-center max-w-sm mb-6">
            这是「{menuItemName}」菜单的内容区域。默认是空的，您可以点击下方的按钮快速构建您设计的界面。
          </p>

          <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
            <button
              onClick={() => onLoadTemplate('venus-storage')}
              className="px-4 py-2 bg-white border border-slate-200 hover:border-brand hover:text-brand text-slate-700 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
            >
              <LucideIcon name="Database" size={14} />
              加载 Venus 存储管理模板 (还原截图)
            </button>
            <button
              onClick={() => onLoadTemplate('cluster-dashboard')}
              className="px-4 py-2 bg-white border border-slate-200 hover:border-brand hover:text-brand text-slate-700 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
            >
              <LucideIcon name="Activity" size={14} />
              加载集群运行监控看板
            </button>
            <button
              onClick={() => addBlock('header')}
              className="px-4 py-2 bg-brand hover:bg-brand-hover text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
            >
              <LucideIcon name="Plus" size={14} />
              手动添加第一个模块
            </button>
          </div>
        </div>
      )}

      {/* Main Blocks List */}
      <div className="space-y-6">
        {blocks.map((block, index) => {
          const isEditing = editingBlockId === block.id;

          // If a non-storage tab is active, only render the header block
          if (activeTab !== '存储管理' && block.type !== 'header') {
            return null;
          }

          return (
            <div
              key={block.id}
              className={`relative transition-all ${
                isDesignMode
                  ? 'border-2 border-dashed border-slate-200 rounded-lg p-5 bg-slate-50/50 hover:bg-slate-50 hover:border-brand/30'
                  : ''
              }`}
            >
              {/* Designer Action Handles */}
              {isDesignMode && (
                <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-white border border-slate-200 rounded-md shadow-sm px-1.5 py-1 z-10">
                  <span className="text-[10px] uppercase font-bold tracking-wide text-slate-400 px-1 border-r border-slate-100">
                    {block.type === 'header' && '页面头部'}
                    {block.type === 'filter-bar' && '搜索过滤条'}
                    {block.type === 'data-table' && '表格'}
                    {block.type === 'stat-cards' && '指标卡片'}
                    {block.type === 'sandbox' && 'HTML沙盒'}
                  </span>
                  
                  {/* Move Up */}
                  <button
                    onClick={() => moveBlock(index, 'up')}
                    disabled={index === 0}
                    className="p-1 hover:bg-slate-100 rounded text-slate-500 disabled:opacity-30 disabled:hover:bg-transparent"
                    title="上移"
                  >
                    <LucideIcon name="ArrowUp" size={12} />
                  </button>
                  
                  {/* Move Down */}
                  <button
                    onClick={() => moveBlock(index, 'down')}
                    disabled={index === blocks.length - 1}
                    className="p-1 hover:bg-slate-100 rounded text-slate-500 disabled:opacity-30 disabled:hover:bg-transparent"
                    title="下移"
                  >
                    <LucideIcon name="ArrowDown" size={12} />
                  </button>

                  {/* Configure */}
                  <button
                    onClick={() => setEditingBlockId(isEditing ? null : block.id)}
                    className={`p-1 rounded transition-colors ${
                      isEditing ? 'bg-brand text-white' : 'hover:bg-slate-100 text-slate-500'
                    }`}
                    title="配置"
                  >
                    <LucideIcon name="Settings" size={12} />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => deleteBlock(block.id)}
                    className="p-1 hover:bg-red-50 hover:text-red-500 rounded text-slate-500 transition-colors"
                    title="删除"
                  >
                    <LucideIcon name="Trash" size={12} />
                  </button>
                </div>
              )}

              {/* RENDER BLOCK CONTENT */}
              <div className="w-full">
                {block.type === 'header' && (
                  <RenderHeaderBlock
                    config={block.config}
                    onTabClick={(tab) => updateBlockConfig(block.id, { activeTab: tab })}
                  />
                )}
                {block.type === 'filter-bar' && (
                  <RenderFilterBarBlock config={block.config} />
                )}
                {block.type === 'data-table' && (
                  <RenderDataTableBlock config={block.config} />
                )}
                {block.type === 'stat-cards' && (
                  <RenderStatCardsBlock config={block.config} />
                )}
                {block.type === 'sandbox' && (
                  <RenderSandboxBlock config={block.config} />
                )}
              </div>

              {/* BLOCK EDITOR PANEL */}
              {isDesignMode && isEditing && (
                <div className="mt-4 bg-white border border-slate-200 rounded-lg p-4 shadow-inner">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                    <h4 className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                      <LucideIcon name="Sliders" size={13} className="text-brand" />
                      修改模块参数
                    </h4>
                    <button
                      onClick={() => setEditingBlockId(null)}
                      className="text-xs text-slate-400 hover:text-slate-600"
                    >
                      收起
                    </button>
                  </div>

                  {block.type === 'header' && (
                    <EditHeaderBlock
                      config={block.config}
                      onChange={(newConfig) => updateBlockConfig(block.id, newConfig)}
                    />
                  )}
                  {block.type === 'filter-bar' && (
                    <EditFilterBarBlock
                      config={block.config}
                      onChange={(newConfig) => updateBlockConfig(block.id, newConfig)}
                    />
                  )}
                  {block.type === 'data-table' && (
                    <EditDataTableBlock
                      config={block.config}
                      onChange={(newConfig) => updateBlockConfig(block.id, newConfig)}
                    />
                  )}
                  {block.type === 'stat-cards' && (
                    <EditStatCardsBlock
                      config={block.config}
                      onChange={(newConfig) => updateBlockConfig(block.id, newConfig)}
                    />
                  )}
                  {block.type === 'sandbox' && (
                    <EditSandboxBlock
                      config={block.config}
                      onChange={(newConfig) => updateBlockConfig(block.id, newConfig)}
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Render credentials manager when Third Party Credentials tab is selected */}
        {activeTab === '第三方凭证管理' && (
          <div className="w-full">
            <CredentialsManager />
          </div>
        )}

        {/* Render placeholder for other empty tabs */}
        {['模型仓库', '数据集', '镜像仓库'].includes(activeTab) && (
          <div className="bg-white border border-slate-200 rounded-lg p-12 text-center shadow-sm max-w-4xl mx-auto my-4 animate-fadeIn">
            <div className="w-12 h-12 bg-brand/5 border border-brand/10 text-brand rounded-full flex items-center justify-center mx-auto mb-4">
              <LucideIcon name={activeTab === '模型仓库' ? 'Box' : activeTab === '数据集' ? 'Database' : 'Layers'} size={20} />
            </div>
            <h4 className="text-sm font-bold text-slate-800 mb-1">{activeTab}</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">这是「{activeTab}」子模块的内容区域。当前处于建设中或已由第三方外部系统统一接管。</p>
          </div>
        )}
      </div>

      {/* Floating Add Block Menu at Bottom of Designer */}
      {isDesignMode && activeTab === '存储管理' && (
        <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col items-center">
          <p className="text-xs text-slate-400 mb-3">点击在页面末尾添加新的 UI 模块</p>
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => addBlock('header')}
              className="px-3 py-1.5 bg-white border border-slate-200 hover:border-brand text-slate-700 text-xs font-semibold rounded-lg hover:text-brand transition-all flex items-center gap-1 shadow-sm cursor-pointer"
            >
              <LucideIcon name="Heading" size={12} />
              + 页面头部
            </button>
            <button
              onClick={() => addBlock('filter-bar')}
              className="px-3 py-1.5 bg-white border border-slate-200 hover:border-brand text-slate-700 text-xs font-semibold rounded-lg hover:text-brand transition-all flex items-center gap-1 shadow-sm cursor-pointer"
            >
              <LucideIcon name="SlidersHorizontal" size={12} />
              + 搜索过滤条
            </button>
            <button
              onClick={() => addBlock('data-table')}
              className="px-3 py-1.5 bg-white border border-slate-200 hover:border-brand text-slate-700 text-xs font-semibold rounded-lg hover:text-brand transition-all flex items-center gap-1 shadow-sm cursor-pointer"
            >
              <LucideIcon name="Table" size={12} />
              + 数据表格
            </button>
            <button
              onClick={() => addBlock('stat-cards')}
              className="px-3 py-1.5 bg-white border border-slate-200 hover:border-brand text-slate-700 text-xs font-semibold rounded-lg hover:text-brand transition-all flex items-center gap-1 shadow-sm cursor-pointer"
            >
              <LucideIcon name="CreditCard" size={12} />
              + 指标卡片
            </button>
            <button
              onClick={() => addBlock('sandbox')}
              className="px-3 py-1.5 bg-white border border-slate-200 hover:border-brand text-slate-700 text-xs font-semibold rounded-lg hover:text-brand transition-all flex items-center gap-1 shadow-sm cursor-pointer"
            >
              <LucideIcon name="Code" size={12} />
              + HTML沙盒
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================================
   BLOCK RENDERING COMPONENTS
   ============================================================================ */

// 1. Header Block
function RenderHeaderBlock({ config, onTabClick }: { config: any; onTabClick: (tab: string) => void }) {
  const tabs = config.tabs || [];
  return (
    <div className="mb-4">
      <h2 className="text-base font-bold text-slate-800 tracking-tight mb-3">
        {config.title || '标题'}
      </h2>
      {tabs.length > 0 && (
        <div className="flex border-b border-slate-200">
          {tabs.map((tab: string) => {
            const isActive = config.activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => onTabClick(tab)}
                className={`px-4 py-2 text-xs font-bold border-b-2 transition-all mr-6 -mb-[1px] cursor-pointer ${
                  isActive
                    ? 'border-brand text-brand font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// 2. Filter Bar Block
function RenderFilterBarBlock({ config }: { config: any }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3 border-b border-slate-100 mb-4 bg-white">
      <h3 className="text-sm font-bold text-slate-800">{config.title || '子管理'}</h3>
      <div className="flex flex-wrap items-center gap-2">
        {config.tenantLabel && (
          <div className="relative min-w-[120px]">
            <select className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-600 focus:outline-none focus:border-brand appearance-none pr-8">
              <option value="">{config.tenantPlaceholder || '请选择租户'}</option>
              <option value="test">test (测试租户)</option>
              <option value="venus">venus (核心计算)</option>
            </select>
            <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none text-slate-400">
              <LucideIcon name="ChevronDown" size={12} />
            </div>
          </div>
        )}

        <div className="relative">
          <input
            type="text"
            placeholder={config.searchPlaceholder || '检索...'}
            className="w-full min-w-[200px] bg-white border border-slate-200 rounded-lg pl-3 pr-8 py-1.5 text-xs text-slate-600 focus:outline-none focus:border-brand"
          />
          <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none text-slate-400">
            <LucideIcon name="Search" size={12} />
          </div>
        </div>

        {config.buttonText && (
          <button className="px-4 py-1.5 bg-brand hover:bg-brand-hover text-white font-bold text-xs rounded-lg shadow-sm transition-colors flex items-center gap-1 cursor-pointer">
            <LucideIcon name="Plus" size={12} />
            {config.buttonText}
          </button>
        )}
      </div>
    </div>
  );
}

// 3. Data Table Block
function RenderDataTableBlock({ config }: { config: any }) {
  const columns = config.columns || [];
  const rows = config.rows || [];

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] text-slate-500 font-bold uppercase tracking-wider">
              {columns.map((col: any) => (
                <th key={col.key} className="px-5 py-3 font-bold">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {rows.map((row: any, rIdx: number) => (
              <tr key={row.id || rIdx} className="hover:bg-slate-50/50 transition-colors">
                {columns.map((col: any) => {
                  const val = row[col.key];

                  if (col.key === 'status') {
                    const isBound = val === 'Bound' || val === '成功' || val === 'Success';
                    const isPending = val === 'Pending' || val === '等待中' || val === '排队中';

                    return (
                      <td key={col.key} className="px-5 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold leading-none ${
                            isBound
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : isPending
                              ? 'bg-orange-50 text-orange-700 border border-orange-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {val}
                        </span>
                      </td>
                    );
                  }

                  if (col.key === 'actions') {
                    return (
                      <td key={col.key} className="px-5 py-3">
                        <div className="flex items-center gap-3 font-semibold">
                          <button className="text-brand hover:text-brand-hover font-bold transition-colors cursor-pointer">
                            更新
                          </button>
                          <button className="text-rose-500 hover:text-rose-700 font-bold transition-colors cursor-pointer">
                            删除
                          </button>
                        </div>
                      </td>
                    );
                  }

                  if (col.key === 'name') {
                    return (
                      <td key={col.key} className="px-5 py-3 font-bold text-brand hover:underline cursor-pointer">
                        {val}
                      </td>
                    );
                  }

                  return (
                    <td key={col.key} className="px-5 py-3 text-slate-600 font-mono">
                      {val}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Standard Pagination Footer to mimic Venus platform */}
      <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex items-center justify-end gap-4 text-xs text-slate-500 font-sans">
        <div className="flex items-center gap-1">
          <button className="p-1 rounded hover:bg-slate-100 border border-slate-200 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
            <LucideIcon name="ChevronLeft" size={12} />
          </button>
          <span className="px-2.5 py-1 bg-white border border-brand text-brand font-bold rounded text-xs shadow-sm">
            1
          </span>
          <button className="p-1 rounded hover:bg-slate-100 border border-slate-200 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
            <LucideIcon name="ChevronRight" size={12} />
          </button>
        </div>
        
        <div className="relative">
          <select className="bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-600 focus:outline-none focus:border-brand pr-6 appearance-none cursor-pointer">
            <option>10条/页</option>
            <option>20条/页</option>
            <option>50条/页</option>
          </select>
          <div className="absolute inset-y-0 right-1.5 flex items-center pointer-events-none text-slate-400">
            <LucideIcon name="ChevronDown" size={10} />
          </div>
        </div>
      </div>
    </div>
  );
}

// 4. Stat Cards Block
function RenderStatCardsBlock({ config }: { config: any }) {
  const cards = config.cards || [];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
      {cards.map((card: any, idx: number) => {
        let colorClass = 'text-brand bg-brand-light border border-brand/10';
        let valColor = 'text-slate-800';
        if (card.color === 'emerald' || card.color === 'green') colorClass = 'text-emerald-500 bg-emerald-50 border border-emerald-100';
        if (card.color === 'rose' || card.color === 'red') colorClass = 'text-rose-500 bg-rose-50 border border-rose-100';
        if (card.color === 'indigo') colorClass = 'text-brand bg-brand-light border border-brand/15';

        return (
          <div key={idx} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">{card.label}</p>
              <h4 className={`text-xl font-bold ${valColor} font-sans`}>{card.value}</h4>
              {card.trend && <p className="text-[10px] text-slate-500 mt-1 font-semibold">{card.trend}</p>}
            </div>
            <div className={`p-2 rounded-md ${colorClass}`}>
              <LucideIcon name={card.color === 'rose' ? 'AlertTriangle' : 'TrendingUp'} size={16} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// 5. Sandbox Block
function RenderSandboxBlock({ config }: { config: any }) {
  return (
    <div
      className="mb-4 text-slate-700"
      dangerouslySetInnerHTML={{ __html: config.htmlContent || '<div>（空沙箱组件）</div>' }}
    />
  );
}

/* ============================================================================
   BLOCK CONFIG EDITORS
   ============================================================================ */

// 1. Edit Header Block
function EditHeaderBlock({ config, onChange }: { config: any; onChange: (cfg: any) => void }) {
  const [title, setTitle] = useState(config.title || '');
  const [tabsText, setTabsText] = useState((config.tabs || []).join(', '));
  const [activeTab, setActiveTab] = useState(config.activeTab || '');

  const handleBlur = () => {
    const tabsArr = tabsText
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t !== '');
    onChange({ title, tabs: tabsArr, activeTab });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
      <div>
        <label className="block text-slate-500 mb-1 font-bold">主标题</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleBlur}
          className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-brand"
        />
      </div>
      <div>
        <label className="block text-slate-500 mb-1 font-bold">页签标签（用逗号隔开）</label>
        <input
          type="text"
          value={tabsText}
          onChange={(e) => setTabsText(e.target.value)}
          onBlur={handleBlur}
          className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-brand"
        />
      </div>
      <div>
        <label className="block text-slate-500 mb-1 font-bold">当前激活页签</label>
        <input
          type="text"
          value={activeTab}
          onChange={(e) => setActiveTab(e.target.value)}
          onBlur={handleBlur}
          className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-brand"
        />
      </div>
    </div>
  );
}

// 2. Edit Filter Bar Block
function EditFilterBarBlock({ config, onChange }: { config: any; onChange: (cfg: any) => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
      <div>
        <label className="block text-slate-500 mb-1 font-bold">小标题名称</label>
        <input
          type="text"
          value={config.title || ''}
          onChange={(e) => onChange({ title: e.target.value })}
          className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-brand"
        />
      </div>
      <div>
        <label className="block text-slate-500 mb-1 font-bold">租户筛选器占位文本</label>
        <input
          type="text"
          value={config.tenantPlaceholder || ''}
          onChange={(e) => onChange({ tenantPlaceholder: e.target.value })}
          className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-brand"
        />
      </div>
      <div>
        <label className="block text-slate-500 mb-1 font-bold">搜索框提示词</label>
        <input
          type="text"
          value={config.searchPlaceholder || ''}
          onChange={(e) => onChange({ searchPlaceholder: e.target.value })}
          className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-brand"
        />
      </div>
      <div>
        <label className="block text-slate-500 mb-1 font-bold">主操作按钮名称</label>
        <input
          type="text"
          value={config.buttonText || ''}
          onChange={(e) => onChange({ buttonText: e.target.value })}
          className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-brand"
        />
      </div>
    </div>
  );
}

// 3. Edit Data Table Block
function EditDataTableBlock({ config, onChange }: { config: any; onChange: (cfg: any) => void }) {
  const rows = config.rows || [];
  const columns = config.columns || [];

  const updateRow = (idx: number, key: string, val: string) => {
    const updated = [...rows];
    updated[idx] = { ...updated[idx], [key]: val };
    onChange({ rows: updated });
  };

  const addRow = () => {
    const newRow = {
      id: `row-${Math.random().toString(36).substring(2, 9)}`,
      name: '新命名项',
      type: 'nfs-client',
      capacity: '2 Gi',
      status: 'Bound',
      createdAt: '2026-07-05 12:00:00',
      tenant: 'demo'
    };
    onChange({ rows: [...rows, newRow] });
  };

  const deleteRow = (idx: number) => {
    const updated = rows.filter((_: any, i: number) => i !== idx);
    onChange({ rows: updated });
  };

  return (
    <div className="space-y-4 text-xs text-slate-700">
      <div className="flex items-center justify-between font-bold text-slate-600 mb-2">
        <span>表格行数据设计</span>
        <button
          type="button"
          onClick={addRow}
          className="px-3 py-1.5 bg-brand-light border border-brand/20 text-brand rounded-lg hover:bg-brand-light/70 font-bold transition-all flex items-center gap-1 cursor-pointer"
        >
          <LucideIcon name="Plus" size={12} />
          增加一行
        </button>
      </div>

      <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100 bg-slate-50/50">
        {rows.map((row: any, rIdx: number) => (
          <div key={row.id || rIdx} className="p-3 bg-white grid grid-cols-1 sm:grid-cols-6 gap-2 items-center">
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5 font-bold">名称</label>
              <input
                type="text"
                value={row.name || ''}
                onChange={(e) => updateRow(rIdx, 'name', e.target.value)}
                className="w-full px-2 py-1.5 border border-slate-200 rounded-md font-bold text-brand focus:outline-none focus:border-brand"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5 font-bold">类型</label>
              <input
                type="text"
                value={row.type || ''}
                onChange={(e) => updateRow(rIdx, 'type', e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg font-mono focus:outline-none focus:border-brand"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5 font-bold">容量</label>
              <input
                type="text"
                value={row.capacity || ''}
                onChange={(e) => updateRow(rIdx, 'capacity', e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg font-mono focus:outline-none focus:border-brand"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5 font-bold">状态</label>
              <select
                value={row.status || ''}
                onChange={(e) => updateRow(rIdx, 'status', e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-brand cursor-pointer"
              >
                <option value="Bound">Bound (已绑定)</option>
                <option value="Pending">Pending (待挂载)</option>
                <option value="Success">Success (成功)</option>
                <option value="Failed">Failed (失败)</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5 font-bold">租户 / 其他列</label>
              <input
                type="text"
                value={row.tenant || ''}
                onChange={(e) => updateRow(rIdx, 'tenant', e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-brand"
              />
            </div>
            <div className="flex justify-end pt-3">
              <button
                type="button"
                onClick={() => deleteRow(rIdx)}
                className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                title="删除此行"
              >
                <LucideIcon name="Trash" size={14} />
              </button>
            </div>
          </div>
        ))}

        {rows.length === 0 && (
          <div className="text-center py-6 text-slate-400 font-semibold">目前没有数据，点击「增加一行」设计表格数据。</div>
        )}
      </div>
    </div>
  );
}

// 4. Edit Stat Cards Block
function EditStatCardsBlock({ config, onChange }: { config: any; onChange: (cfg: any) => void }) {
  const cards = config.cards || [];

  const updateCard = (idx: number, key: string, val: string) => {
    const updated = [...cards];
    updated[idx] = { ...updated[idx], [key]: val };
    onChange({ cards: updated });
  };

  const addCard = () => {
    onChange({
      cards: [...cards, { label: '新建指标', value: '0', trend: '稳定', color: 'blue' }]
    });
  };

  const deleteCard = (idx: number) => {
    onChange({
      cards: cards.filter((_: any, i: number) => i !== idx)
    });
  };

  return (
    <div className="space-y-4 text-xs font-sans">
      <div className="flex items-center justify-between font-bold text-slate-600 mb-2">
        <span>指标卡片设计</span>
        <button
          type="button"
          onClick={addCard}
          className="px-3 py-1.5 bg-brand-light border border-brand/20 text-brand rounded-lg hover:bg-brand-light/70 font-bold transition-all flex items-center gap-1 cursor-pointer"
        >
          <LucideIcon name="Plus" size={12} />
          增加卡片
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-1 bg-slate-50/50 border border-slate-200 rounded-lg">
        {cards.map((card: any, idx: number) => (
          <div key={idx} className="bg-white p-3 border border-slate-200 rounded-lg shadow-sm relative pr-10">
            <button
              onClick={() => deleteCard(idx)}
              className="absolute top-2 right-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg cursor-pointer"
              title="删除"
            >
              <LucideIcon name="Trash" size={12} />
            </button>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5 font-bold">指标名</label>
                <input
                  type="text"
                  value={card.label || ''}
                  onChange={(e) => updateCard(idx, 'label', e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-brand"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5 font-bold">指标值</label>
                <input
                  type="text"
                  value={card.value || ''}
                  onChange={(e) => updateCard(idx, 'value', e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg font-bold text-slate-800 focus:outline-none focus:border-brand"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5 font-bold">趋势标签 / 备注</label>
                <input
                  type="text"
                  value={card.trend || ''}
                  onChange={(e) => updateCard(idx, 'trend', e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-brand"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5 font-bold">卡片主题色</label>
                <select
                  value={card.color || 'blue'}
                  onChange={(e) => updateCard(idx, 'color', e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-brand cursor-pointer"
                >
                  <option value="blue">核心 (Brand)</option>
                  <option value="indigo">紫 (Indigo)</option>
                  <option value="emerald">绿 (Emerald)</option>
                  <option value="rose">红 (Rose)</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 5. Edit Sandbox Block
function EditSandboxBlock({ config, onChange }: { config: any; onChange: (cfg: any) => void }) {
  return (
    <div className="text-xs">
      <label className="block text-slate-500 font-bold mb-1 flex items-center gap-1">
        <LucideIcon name="Code" size={13} />
        自定义 HTML 页面代码
      </label>
      <p className="text-[10px] text-slate-400 mb-2 font-semibold">您可以编写标准的 HTML 标签与 Tailwind 类名，以随心所欲设计专属页面内容。</p>
      <textarea
        rows={6}
        value={config.htmlContent || ''}
        onChange={(e) => onChange({ htmlContent: e.target.value })}
        className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono text-xs text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-brand"
        placeholder="编写您的HTML代码..."
      />
    </div>
  );
}
