import React, { useState } from 'react';
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
  // GanttFeatureItem,
  GanttToday,
  GanttMarker,
  type GanttFeature,
  type GanttStatus,
  type GanttMarkerProps,
} from '@/components/kibo-ui/gantt';
import { Card, CardHeader, CardTitle } from '@/components/kibo-ui';
import { Badge } from '@/components/kibo-ui';

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
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);

  const handleFeatureMove = (id: string, startAt: Date, endAt: Date | null) => {
    setFeatures(prev => prev.map(feature => 
      feature.id === id 
        ? { ...feature, startAt, endAt: endAt || new Date(startAt.getTime() + 24 * 60 * 60 * 1000) }
        : feature
    ));
  };

  const handleAddItem = (date: Date) => {
    const newFeature: GanttFeature = {
      id: `feature-${Date.now()}`,
      name: `New Feature ${features.length + 1}`,
      startAt: date,
      endAt: new Date(date.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days later
      status: sampleStatuses[0]!,
      lane: 'general',
    };
    setFeatures(prev => [...prev, newFeature]);
  };

  const handleRemoveMarker = (id: string) => {
    setMarkers(prev => prev.filter(marker => marker.id !== id));
  };

  // const handleCreateMarker = (date: Date) => {
  //   const newMarker: GanttMarkerProps = {
  //     id: `marker-${Date.now()}`,
  //     date,
  //     label: `Marker ${markers.length + 1}`,
  //   };
  //   setMarkers(prev => [...prev, newMarker]);
  // };

  // Group features by lane
  const featuresByLane = features.reduce((acc, feature) => {
    const lane = feature.lane || 'general';
    if (!acc[lane]) {
      acc[lane] = [];
    }
    acc[lane].push(feature);
    return acc;
  }, {} as Record<string, GanttFeature[]>);

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
        <GanttProvider
          range="monthly"
          zoom={100}
          onAddItem={handleAddItem}
        >
          <div className="flex h-full">
            {/* Sidebar */}
            <GanttSidebar>
              {Object.entries(featuresByLane).map(([lane, laneFeatures]) => (
                <GanttSidebarGroup key={lane} name={lane.charAt(0).toUpperCase() + lane.slice(1)}>
                  {laneFeatures.map(feature => (
                    <GanttSidebarItem
                      key={feature.id}
                      feature={feature}
                      onSelectItem={setSelectedFeature}
                      className={selectedFeature === feature.id ? 'bg-accent' : ''}
                    />
                  ))}
                </GanttSidebarGroup>
              ))}
            </GanttSidebar>

            {/* Timeline */}
            <GanttTimeline>
              <GanttHeader />
              
              <GanttFeatureList>
                {Object.entries(featuresByLane).map(([lane, laneFeatures]) => (
                  <GanttFeatureListGroup key={lane}>
                    <GanttFeatureRow
                      features={laneFeatures}
                      onMove={handleFeatureMove}
                    >
                      {(feature) => (
                        <div className="flex items-center justify-between w-full">
                          <span className="truncate text-xs font-medium">
                            {feature.name}
                          </span>
                    <div 
                      className="ml-2 h-2 w-2 rounded-full"
                      style={{ backgroundColor: feature.status.color }}
                    />
                        </div>
                      )}
                    </GanttFeatureRow>
                  </GanttFeatureListGroup>
                ))}
              </GanttFeatureList>

              {/* Today marker */}
              <GanttToday />
              
              {/* Custom markers */}
              {markers.map(marker => (
                <GanttMarker
                  key={marker.id}
                  {...marker}
                  onRemove={handleRemoveMarker}
                />
              ))}
            </GanttTimeline>
          </div>
        </GanttProvider>
      </div>

      {/* Controls */}
      <div className="mt-4 flex gap-4 items-center">
        <div className="text-sm text-muted-foreground">
          Total Features: {features.length} | Markers: {markers.length}
        </div>
        <div className="flex gap-2">
          {sampleStatuses.map(status => (
            <Badge 
              key={status.id} 
              variant="secondary" 
              className="flex items-center gap-2"
            >
              <div 
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: status.color }}
              />
              <span className="text-xs">{status.name}</span>
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GanttExample;
