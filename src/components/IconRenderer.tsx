/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import * as Icons from 'lucide-react';

interface IconRendererProps {
  name: string;
  className?: string;
  size?: number;
}

export const IconRenderer: React.FC<IconRendererProps> = ({ name, className = '', size = 20 }) => {
  // Try exact match or fallback
  const IconComponent = (Icons as Record<string, any>)[name] || Icons.ExternalLink;

  return <IconComponent className={className} size={size} />;
};

export const AVAILABLE_ICONS = [
  'Globe',
  'Newspaper',
  'IdCard',
  'Briefcase',
  'HelpCircle',
  'FileText',
  'Layers',
  'ShieldCheck',
  'Database',
  'Clock',
  'Terminal',
  'Cpu',
  'Boxes',
  'BarChart3',
  'ClipboardCheck',
  'BookOpen',
  'Server',
  'ShoppingCart',
  'Users',
  'FolderGit2',
  'Mail',
  'Calendar',
  'Smartphone',
  'HardDrive',
  'Workflow',
  'LifeBuoy',
];
