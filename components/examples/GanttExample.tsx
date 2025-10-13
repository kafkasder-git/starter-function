import React, { useState } from 'react';
// TODO: Gantt components need to be implemented
// import {
//   GanttProvider,
//   GanttSidebar,
//   GanttSidebarGroup,
//   GanttSidebarItem,
//   GanttTimeline,
//   GanttHeader,
//   GanttFeatureList,
//   GanttFeatureListGroup,
//   GanttFeatureRow,
//   // GanttFeatureItem,
//   GanttToday,
//   GanttMarker,
//   type GanttFeature,
//   type GanttStatus,
//   type GanttMarkerProps,
// } from '@/components/ui';
import { Card, CardHeader, CardTitle, Badge } from '@/components/ui';

// Type definitions for Gantt components (when implemented)
type GanttStatus = {
  id: string;
  name: string;
  color: string;
};

type GanttFeature = {
  id: string;
  name: string;
  startAt: Date;
  endAt: Date;
  status: GanttStatus;
  lane?: string;
};

type GanttMarkerProps = {
  id: string;
  date: Date;
  label: string;
};

// Sample data
const sampleStatuses: GanttStatus[] = [
  { id: 'todo', name: 'To Do', color: 'hsl(var(--neutral-400))' },
  { id: 'in-progress', name: 'In Progress', color: 'hsl(var(--info-500))' },
  { id: 'done', name: 'Done', color: 'hsl(var(--success-500))' },
  { id: 'blocked', name: 'Blocked', color: 'hsl(var(--error-500))' },
];

const sampleFeatures: GanttFeature[] = [
  {
    id: '1',
    name: 'User Authentication',
    startAt: new Date(2024, 0, 1),
    endAt: new Date(2024, 0, 15),
    status: sampleStatuses[0]!,
    lane: 'backend',
  },
  {
    id: '2',
    name: 'Database Setup',
    startAt: new Date(2024, 0, 5),
    endAt: new Date(2024, 0, 20),
    status: sampleStatuses[1]!,
    lane: 'backend',
  },
  {
    id: '3',
    name: 'Frontend Components',
    startAt: new Date(2024, 0, 10),
    endAt: new Date(2024, 0, 25),
    status: sampleStatuses[0]!,
    lane: 'frontend',
  },
  {
    id: '4',
    name: 'API Integration',
    startAt: new Date(2024, 0, 15),
    endAt: new Date(2024, 0, 30),
    status: sampleStatuses[2]!,
    lane: 'frontend',
  },
  {
    id: '5',
    name: 'Testing & QA',
    startAt: new Date(2024, 1, 1),
    endAt: new Date(2024, 1, 10),
    status: sampleStatuses[0]!,
    lane: 'testing',
  },
];

const sampleMarkers: GanttMarkerProps[] = [
  {
    id: 'milestone-1',
    date: new Date(2024, 0, 20),
    label: 'Milestone 1',
  },
  {
    id: 'milestone-2',
    date: new Date(2024, 1, 5),
    label: 'Milestone 2',
  },
];

export const GanttExample: React.FC = () => {
  const [features, setFeatures] = useState<GanttFeature[]>(sampleFeatures);
  const [markers, setMarkers] = useState<GanttMarkerProps[]>(sampleMarkers);

  return (
    <div className="h-screen w-full p-4">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Gantt Chart Example</CardTitle>
          <p className="text-muted-foreground">
            A comprehensive project timeline with drag-and-drop functionality
          </p>
        </CardHeader>
      </Card>

      <div className="h-[calc(100vh-120px)]">
        <Card className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">Gantt Chart Component</h3>
            <p className="text-muted-foreground mb-4">
              The Gantt chart components are not yet implemented.
            </p>
            <p className="text-sm text-muted-foreground">
              This placeholder shows the data structure that would be used:
            </p>
            <div className="mt-4 text-left bg-muted p-4 rounded-lg max-w-md mx-auto">
              <div className="text-sm">
                <div>Features: {features.length}</div>
                <div>Markers: {markers.length}</div>
                <div>Status Types: {sampleStatuses.length}</div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Status badges */}
      <div className="mt-4 flex gap-4 items-center">
        <div className="text-sm text-muted-foreground">
          Total Features: {features.length} | Markers: {markers.length}
        </div>
        <div className="flex gap-2">
          {sampleStatuses.map((status) => (
            <Badge key={status.id} variant="secondary" className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: status.color }} />
              <span className="text-xs">{status.name}</span>
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GanttExample;
