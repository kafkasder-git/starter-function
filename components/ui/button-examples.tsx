/**
 * @fileoverview Button Examples - Demonstrating enhanced button features
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { Button } from './button';
import { Bell, Save, Trash2, Plus } from 'lucide-react';

/**
 * Examples demonstrating the enhanced button component features
 */
export function ButtonExamples() {
  return (
    <div className="space-y-8 p-8">
      {/* Soft Variant Example */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Soft Variant (Subtask 2.1)</h2>
        <div className="flex gap-4 flex-wrap">
          <Button variant="soft">Soft Button</Button>
          <Button variant="soft" size="sm">Small Soft</Button>
          <Button variant="soft" size="lg">Large Soft</Button>
          <Button variant="soft" disabled>Disabled Soft</Button>
        </div>
      </section>

      {/* Enhanced Focus and Disabled States Example */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Enhanced Focus & Disabled States (Subtask 2.2)</h2>
        <div className="flex gap-4 flex-wrap">
          <Button>Focus me with Tab</Button>
          <Button variant="destructive">Destructive Focus</Button>
          <Button disabled>Disabled (60% opacity, desaturated)</Button>
          <Button variant="outline" disabled>Disabled Outline</Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Try tabbing through these buttons to see the improved focus ring (2px ring with offset)
        </p>
      </section>

      {/* Tooltip Support Example */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Tooltip Support (Subtask 2.3)</h2>
        <div className="flex gap-4 flex-wrap">
          <Button tooltip="Save your changes">
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
          <Button variant="destructive" tooltip="Delete permanently">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
          <Button variant="outline" tooltip="Add new item" size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Hover over these buttons to see accessible tooltips
        </p>
      </section>

      {/* Badge Support Example */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Badge Support (Subtask 2.3)</h2>
        <div className="flex gap-4 flex-wrap">
          <Button badge={3}>
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </Button>
          <Button variant="outline" badge={12}>
            Messages
          </Button>
          <Button variant="ghost" badge="99+" size="icon">
            <Bell className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Badges appear in the top-right corner with proper ARIA labels
        </p>
      </section>

      {/* Mobile Touch Targets Example */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Mobile Touch Targets (Subtask 2.4)</h2>
        <div className="flex gap-4 flex-wrap">
          <Button size="sm">Small (44px on mobile)</Button>
          <Button>Default (44px on mobile)</Button>
          <Button size="lg">Large (44px on mobile)</Button>
          <Button size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          All buttons maintain a minimum 44px touch target on mobile devices (below md breakpoint)
        </p>
      </section>

      {/* Combined Features Example */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Combined Features</h2>
        <div className="flex gap-4 flex-wrap">
          <Button 
            variant="soft" 
            tooltip="Save your work" 
            badge={1}
          >
            <Save className="mr-2 h-4 w-4" />
            Save Draft
          </Button>
          <Button 
            variant="default" 
            tooltip="You have 5 new notifications" 
            badge={5}
            size="icon"
          >
            <Bell className="h-4 w-4" />
          </Button>
          <Button 
            variant="destructive" 
            tooltip="This action cannot be undone"
            disabled
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete All
          </Button>
        </div>
      </section>
    </div>
  );
}
