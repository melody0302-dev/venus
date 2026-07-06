import { SidebarSection, PageContent } from './types';

// Helper to generate IDs
const uuid = () => Math.random().toString(36).substring(2, 9);

export const createEmptyContent = (): PageContent => ({
  blocks: []
});

export const DEFAULT_SIDEBAR_DATA: SidebarSection[] = [
  {
    id: 'sec-monitor',
    title: '监控',
    items: [
      {
        id: 'item-cluster-monitor',
        name: '集群监控',
        icon: 'Activity',
        content: createEmptyContent()
      },
      {
        id: 'item-node-monitor',
        name: '节点监控',
        icon: 'Cpu',
        content: createEmptyContent()
      },
      {
        id: 'item-task-monitor',
        name: '任务监控',
        icon: 'Layers',
        content: createEmptyContent()
      }
    ]
  },
  {
    id: 'sec-resources',
    title: '集群资源',
    items: [
      {
        id: 'item-node-manage',
        name: '节点管理',
        icon: 'Server',
        content: createEmptyContent()
      },
      {
        id: 'item-tenant-resources',
        name: '租户资源',
        icon: 'Users',
        content: createEmptyContent()
      },
      {
        id: 'item-audit-logs',
        name: '审计日志',
        icon: 'FileText',
        content: createEmptyContent()
      },
      {
        id: 'item-service-config',
        name: '服务配置',
        icon: 'Settings',
        content: createEmptyContent()
      },
      {
        id: 'item-priority-config',
        name: '优先级配置',
        icon: 'Sliders',
        content: createEmptyContent()
      },
      {
        id: 'item-cluster-services',
        name: '集群服务管理',
        icon: 'Cloud',
        content: createEmptyContent()
      },
      {
        id: 'item-scheduler-config',
        name: '调度区配置',
        icon: 'GitBranch',
        content: createEmptyContent()
      },
      {
        id: 'item-resource-specs',
        name: '资源规格',
        icon: 'Hash',
        content: createEmptyContent()
      }
    ]
  },
  {
    id: 'sec-business',
    title: '', // Empty title like in the screenshot
    items: [
      {
        id: 'item-task-center',
        name: '任务中心',
        icon: 'Briefcase',
        content: createEmptyContent()
      },
      {
        id: 'item-ai-assets',
        name: 'AI资产管理',
        icon: 'Box',
        content: createEmptyContent()
      }
    ]
  }
];

// Predefined template mirroring the original screenshot layout exactly!
export const VENUS_STORAGE_TEMPLATE: PageContent = {
  blocks: [
    {
      id: 'block-header',
      type: 'header',
      config: {
        title: 'AI资产管理',
        tabs: ['模型仓库', '数据集', '镜像仓库', '存储管理', '第三方凭证管理'],
        activeTab: '存储管理'
      }
    }
  ]
};

// Also offer other clean templates
export const TEMPLATES_LIST: Array<{ id: string; name: string; content: PageContent }> = [
  {
    id: 'empty',
    name: '空白看板 (全新设计)',
    content: createEmptyContent()
  },
  {
    id: 'venus-storage',
    name: 'Venus 存储管理模板 (还原截图)',
    content: VENUS_STORAGE_TEMPLATE
  },
  {
    id: 'cluster-dashboard',
    name: '集群监控仪表盘模板',
    content: {
      blocks: [
        {
          id: 'dash-header',
          type: 'header',
          config: {
            title: '集群运行状态监控',
            tabs: ['概览', '硬件指标', '异常告警'],
            activeTab: '概览'
          }
        },
        {
          id: 'dash-stats',
          type: 'stat-cards',
          config: {
            cards: [
              { label: 'CPU 使用率', value: '78.2%', trend: '+4.5% (过去1小时)', color: 'blue' },
              { label: '内存 使用率', value: '64.5%', trend: '-2.1% (过去1小时)', color: 'indigo' },
              { label: '在线节点数量', value: '12 / 12', trend: '正常运行', color: 'emerald' },
              { label: '待处理告警', value: '3', trend: '需要立即关注', color: 'rose' }
            ]
          }
        },
        {
          id: 'dash-sandbox',
          type: 'sandbox',
          config: {
            htmlContent: `
              <div class="bg-white border border-slate-150 rounded-xl p-5 mt-4">
                <h4 class="text-sm font-semibold text-slate-800 mb-3 flex items-center">
                  <span class="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                  系统健康度评分: <strong class="text-emerald-600 ml-1">98/100</strong>
                </h4>
                <p class="text-xs text-slate-500 leading-relaxed">
                  当前集群调度正常，Pod生命周期平均拉起时间为 1.2 秒。最新执行的高优先任务正在加速调度中。
                </p>
                <div class="mt-4 flex gap-2">
                  <span class="px-2 py-1 bg-slate-50 border border-slate-100 rounded text-[11px] text-slate-600">k8s-version: v1.28.2</span>
                  <span class="px-2 py-1 bg-slate-50 border border-slate-100 rounded text-[11px] text-slate-600">Runtime: containerd</span>
                </div>
              </div>
            `
          }
        }
      ]
    }
  }
];
