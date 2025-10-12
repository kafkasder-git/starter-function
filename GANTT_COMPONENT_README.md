# Gantt Chart Component

A comprehensive Gantt chart component has been successfully added to your project using `kibo-ui`. This component provides a powerful timeline visualization for project management, task tracking, and scheduling.

## Features

- **Interactive Timeline**: Drag and drop functionality for tasks
- **Multiple Views**: Daily, Monthly, and Quarterly timeline views
- **Zoom Control**: Adjustable zoom levels for detailed or overview views
- **Task Management**: Add, edit, and move tasks with visual feedback
- **Status Indicators**: Color-coded status system for tasks
- **Markers**: Add milestone markers to the timeline
- **Responsive Design**: Works on desktop and mobile devices
- **Accessibility**: Keyboard navigation and screen reader support

## Usage

### Basic Setup

```tsx
import {
  GanttProvider,
  GanttSidebar,
  GanttSidebarGroup,
  GanttSidebarItem,
  GanttTimeline,
  GanttHeader,
  GanttFeatureList,
  GanttFeatureListGroup,
  GanttFeatureRow,
  GanttToday,
  GanttMarker,
} from '@/src/components/kibo-ui/gantt';

function MyGanttChart() {
  return (
    <GanttProvider range="monthly" zoom={100}>
      <div className="flex h-full">
        <GanttSidebar>
          <GanttSidebarGroup name="Backend">
            <GanttSidebarItem feature={feature1} />
            <GanttSidebarItem feature={feature2} />
          </GanttSidebarGroup>
        </GanttSidebar>
        
        <GanttTimeline>
          <GanttHeader />
          <GanttFeatureList>
            <GanttFeatureListGroup>
              <GanttFeatureRow features={features} onMove={handleMove} />
            </GanttFeatureListGroup>
          </GanttFeatureList>
          <GanttToday />
          <GanttMarker {...marker} />
        </GanttTimeline>
      </div>
    </GanttProvider>
  );
}
```

### Data Types

```tsx
interface GanttFeature {
  id: string;
  name: string;
  startAt: Date;
  endAt: Date;
  status: GanttStatus;
  lane?: string; // Optional grouping
}

interface GanttStatus {
  id: string;
  name: string;
  color: string;
}

interface GanttMarkerProps {
  id: string;
  date: Date;
  label: string;
}
```

## Accessing the Component

The Gantt component is available at:
- **URL**: `/genel/gantt`
- **Component**: `GanttExample` in `components/examples/GanttExample.tsx`

## Key Components

### Core Components
- `GanttProvider`: Main context provider with configuration
- `GanttTimeline`: Timeline container with header and content
- `GanttSidebar`: Left sidebar for task lists
- `GanttHeader`: Timeline header with date columns

### Feature Components
- `GanttFeatureRow`: Row containing tasks for a specific lane
- `GanttFeatureItem`: Individual task item with drag handles
- `GanttSidebarItem`: Task item in the sidebar

### Utility Components
- `GanttToday`: "Today" marker line
- `GanttMarker`: Custom milestone markers
- `GanttCreateMarkerTrigger`: Invisible trigger for adding markers

## Configuration Options

### GanttProvider Props
- `range`: "daily" | "monthly" | "quarterly" - Timeline view
- `zoom`: number - Zoom level (default: 100)
- `onAddItem`: (date: Date) => void - Callback for adding new items

### Features
- **Drag & Drop**: Tasks can be moved by dragging
- **Resize**: Task duration can be changed by dragging the edges
- **Add Items**: Click in empty space to add new tasks
- **Markers**: Right-click timeline to add milestone markers
- **Scrolling**: Infinite horizontal scrolling with automatic data loading

## Styling

The component uses Tailwind CSS classes and CSS custom properties:
- `--gantt-column-width`: Width of timeline columns
- `--gantt-header-height`: Height of the header
- `--gantt-row-height`: Height of task rows
- `--gantt-sidebar-width`: Width of the sidebar

## Dependencies

The component requires these packages (already installed):
- `@dnd-kit/core` - Drag and drop functionality
- `@dnd-kit/modifiers` - Drag constraints
- `@uidotdev/usehooks` - Mouse tracking and window scroll
- `date-fns` - Date manipulation
- `jotai` - State management
- `lodash.throttle` - Performance optimization
- `lucide-react` - Icons

## Example Features

The included example demonstrates:
- Sample project data with different task statuses
- Grouped tasks by project lanes (backend, frontend, testing)
- Interactive task management
- Milestone markers
- Today indicator
- Status color coding

## Next Steps

You can customize the component by:
1. Modifying the sample data in `GanttExample.tsx`
2. Adding custom status types and colors
3. Integrating with your backend API
4. Adding more advanced features like dependencies
5. Customizing the styling and themes

The component is fully functional and ready to use in your project management system!

