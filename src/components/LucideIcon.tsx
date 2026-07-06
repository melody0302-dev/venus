import * as Icons from 'lucide-react';

interface LucideIconProps {
  name: string;
  className?: string;
  size?: number;
  strokeWidth?: number;
}

export function LucideIcon({ name, className = '', size = 18, strokeWidth = 2 }: LucideIconProps) {
  const IconComponent = (Icons as any)[name];
  
  if (!IconComponent) {
    // Fallback to a default icon if not found
    const Fallback = Icons.HelpCircle;
    return <Fallback className={className} size={size} strokeWidth={strokeWidth} />;
  }

  return <IconComponent className={className} size={size} strokeWidth={strokeWidth} />;
}

// Export the list of icons we want to make available for the user to select
export const AVAILABLE_ICONS = [
  'Activity',
  'Cpu',
  'Layers',
  'Server',
  'Users',
  'FileText',
  'Settings',
  'Sliders',
  'Cloud',
  'GitBranch',
  'Hash',
  'Briefcase',
  'Box',
  'Database',
  'Terminal',
  'Shield',
  'Home',
  'PieChart',
  'Search',
  'Folder',
  'Bell',
  'Globe',
  'Key',
  'Lock',
  'User',
  'Calendar',
  'Heart',
  'Star',
  'Flag',
  'Bookmark',
  'Map',
  'Phone',
  'Mail',
  'Video',
  'Image',
  'Compass',
  'List',
  'Grid'
];
