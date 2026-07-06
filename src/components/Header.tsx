import React from 'react';
import { LucideIcon } from './LucideIcon';

interface HeaderProps {
  isDesignMode: boolean;
  onToggleDesignMode: (val: boolean) => void;
  onResetAll: () => void;
}

export function Header({ isDesignMode, onToggleDesignMode, onResetAll }: HeaderProps) {
  return (
    <header className="h-[54px] bg-white border-b border-slate-200 px-4 flex items-center justify-between select-none shadow-sm z-30">
      
      {/* Left Area: Logo & Platform Name */}
      <div className="flex items-center gap-3">
        <button className="text-slate-700 hover:bg-slate-50 p-1 rounded transition-colors cursor-pointer">
          <LucideIcon name="Menu" size={18} />
        </button>
        
        {/* Venus Sleek Vector SVG Logo */}
        <div className="flex items-center gap-2">
          <svg className="w-6 h-6 text-rose-500" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 8C10.5 12 6.5 22.5 10 29.5C12.5 34.5 19 32.5 21 30.5C23 28.5 28.5 21.5 31.5 14C34.5 6.5 27 5.5 24 8.5C21 11.5 14.5 24.5 17.5 29.5C19 32 23 31.5 25 30"
              stroke="currentColor"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="14" cy="14" r="2" fill="currentColor" />
          </svg>
          <div className="flex items-baseline">
            <span className="font-extrabold text-lg text-slate-800 tracking-tight">Venus</span>
            <span className="font-semibold text-sm text-slate-800 ml-1.5 border-l border-slate-300 pl-1.5">智算平台</span>
          </div>
        </div>
      </div>

      {/* Center/Right Area: Designer Controls & User Settings */}
      <div className="flex items-center gap-4">
        
        {/* Layout Designer Mode Toggle */}
        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs gap-3 font-medium">
          <span className="text-slate-500 flex items-center gap-1">
            <LucideIcon name="Layers" size={12} className={isDesignMode ? "text-brand" : ""} />
            看板设计器
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onToggleDesignMode(false)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-all ${
                !isDesignMode
                  ? 'bg-white border border-slate-200 text-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              浏览视图
            </button>
            <button
              onClick={() => onToggleDesignMode(true)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-all ${
                isDesignMode
                  ? 'bg-brand text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              设计模式
            </button>
          </div>
        </div>

        {/* Restore Defaults/Reset */}
        <button
          onClick={() => {
            if (confirm('确定要恢复默认的菜单与导航栏布局吗？您定制的修改将会丢失。')) {
              onResetAll();
            }
          }}
          className="text-xs text-slate-400 hover:text-slate-600 hover:bg-slate-50 px-2 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer"
          title="重置整个工作台"
        >
          <LucideIcon name="RotateCcw" size={11} />
          <span>重置导航</span>
        </button>

        {/* Separator */}
        <div className="h-4 border-r border-slate-200"></div>

        {/* Right Settings Bar */}
        <div className="flex items-center gap-3 text-xs text-slate-600">
          
          {/* Language Selector */}
          <div className="flex items-center gap-1 hover:text-slate-800 cursor-pointer px-1.5 py-1 rounded hover:bg-slate-50 transition-colors">
            <LucideIcon name="Globe" size={14} className="text-slate-400" />
            <span className="font-medium text-slate-700">中国大陆</span>
            <LucideIcon name="ChevronDown" size={10} className="text-slate-400 ml-0.5" />
          </div>

          {/* Bell Icon */}
          <button className="p-1.5 hover:bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition-colors relative cursor-pointer">
            <LucideIcon name="Bell" size={15} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-2 hover:bg-slate-50 px-2 py-1 rounded-md cursor-pointer transition-colors">
            <div className="w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center text-xs font-semibold shadow-sm">
              <LucideIcon name="User" size={12} strokeWidth={2.5} />
            </div>
            <span className="font-semibold text-slate-700 text-xs">admin</span>
            <LucideIcon name="ChevronDown" size={10} className="text-slate-400" />
          </div>

        </div>
      </div>

    </header>
  );
}
