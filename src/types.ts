export interface PageBlock {
  id: string;
  type: 'header' | 'tabs' | 'filter-bar' | 'data-table' | 'stat-cards' | 'sandbox';
  config: any;
}

export interface PageContent {
  blocks: PageBlock[];
}

export interface SidebarItem {
  id: string;
  name: string;
  icon: string; // Lucide icon name, e.g., 'Activity'
  content: PageContent;
}

export interface SidebarSection {
  id: string;
  title: string;
  items: SidebarItem[];
}

export interface RegistryCredential {
  id: string;
  name: string;
  registryUrl: string;
  type: 'password' | 'token';
  username: string;
  password: string;
  isDefault: boolean;
  description?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt?: string;
  enableProxy?: boolean;
  proxyUrl?: string;
}

