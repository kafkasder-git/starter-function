import * as React from 'react';

import { SidebarContent } from '../components/ui/sidebar';

export function useSidebar() {
  const context = React.useContext(SidebarContent as unknown as React.Context<unknown>);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
