'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import ProjectSidebar from '@/components/ProjectSidebar';
import { useProjects } from '@/hooks/useProjects';
import { useTimeSummaries } from '@/hooks/useTimeSummaries';
import { useWeeklyTime } from '@/hooks/useWeeklyTime';
import { useWeeklyTimeEntries } from '@/hooks/useTimeEntries';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function PlanPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const selectedProjectId = searchParams.get('project');
  const shouldOpenNewProject = searchParams.get('new') === 'true';
  const [isNewProjectSheetOpen, setIsNewProjectSheetOpen] = useState(false);

  // Handle opening the new project sheet when the query parameter is present
  useEffect(() => {
    if (shouldOpenNewProject) {
      setIsNewProjectSheetOpen(true);
      // Remove the 'new' parameter from URL without triggering navigation
      const params = new URLSearchParams(searchParams.toString());
      params.delete('new');
      const newUrl = params.toString() ? `/plan?${params.toString()}` : '/plan';
      router.replace(newUrl);
    }
  }, [shouldOpenNewProject, searchParams, router]);

  // Fetch projects query
  const {
    data: projects = [],
    isLoading,
    error
  } = useProjects();

  // Fetch time summaries
  const {
    data: timeSummaries = [],
    isLoading: isSummariesLoading
  } = useTimeSummaries();

  // Fetch weekly time data for selected project
  const {
    data: weeklyTimeData = [],
    isLoading: isWeeklyLoading
  } = useWeeklyTime(selectedProjectId);

  // Fetch weekly time entries for selected project
  const {
    data: weeklyTimeEntries = [],
    isLoading: isWeeklyEntriesLoading
  } = useWeeklyTimeEntries(selectedProjectId);
  
  const handleProjectSelect = (projectId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('project', projectId);
    router.push(`/plan?${params.toString()}`);
  };

  const handleProjectCreated = async (projectId: string) => {
    queryClient.invalidateQueries({ queryKey: ['projects'] });
    setIsNewProjectSheetOpen(false);
    handleProjectSelect(projectId);
  };

  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Failed to delete project');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    }
  });

  const handleProjectDelete = async (projectId: string) => {
    try {
      await deleteProjectMutation.mutateAsync(projectId);
      
      if (selectedProjectId === projectId) {
        const params = new URLSearchParams(searchParams.toString());
        params.delete('project');
        router.push(`/plan?${params.toString()}`);
      }
    } catch (err) {
      console.error('Error deleting project:', err);
    }
  };

  const selectedProjectData = selectedProjectId 
    ? projects.find(p => p.id === selectedProjectId) 
    : null;

  return (
    <div className="flex h-full min-h-0">
      <ProjectSidebar 
        projects={projects}
        selectedProjectId={selectedProjectId}
        onProjectSelect={handleProjectSelect}
        onProjectCreated={handleProjectCreated}
        onProjectDelete={handleProjectDelete}
        isLoading={isLoading}
        error={error?.message || null}
        isNewProjectSheetOpen={isNewProjectSheetOpen}
        onNewProjectSheetOpenChange={setIsNewProjectSheetOpen}
      />
      
      {selectedProjectData ? (
        <div className="flex-1 p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">{selectedProjectData.name}</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{selectedProjectData.description}</p>
          
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">{ `This Week's Time Tracking` }</h2>
            
            {isWeeklyLoading ? (
              <p className="text-gray-600 dark:text-gray-400">Loading weekly data...</p>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={weeklyTimeData as any[]}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-600" />
                    <XAxis 
                      dataKey="day" 
                      className="text-gray-600 dark:text-gray-400"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      className="text-gray-600 dark:text-gray-400"
                      tick={{ fontSize: 12 }}
                      label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'var(--background)',
                        border: '1px solid var(--border)',
                        borderRadius: '6px'
                      }}
                      formatter={(value: number) => [`${value} minutes`, 'Time Tracked']}
                      labelFormatter={(label) => `${label}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="minutes" 
                      stroke={selectedProjectData.color}
                      strokeWidth={3}
                      dot={{ fill: selectedProjectData.color, strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
          
          {/* Weekly Work Sessions */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mt-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">This Week's Work Sessions</h2>
            
            {isWeeklyEntriesLoading ? (
              <p className="text-gray-600 dark:text-gray-400">Loading work sessions...</p>
            ) : weeklyTimeEntries.length > 0 ? (
              <div className="space-y-4">
                {weeklyTimeEntries.map((entry: any) => (
                  <div key={entry.id} className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {new Date(entry.startTime).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(entry.startTime).toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })} - {new Date(entry.endTime).toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                      {entry.description ? (
                        <p className="text-gray-700 dark:text-gray-300 text-sm">
                          {entry.description}
                        </p>
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400 text-sm italic">
                          No description provided
                        </p>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {entry.duration}m
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400">No work sessions completed this week for this project.</p>
                <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">
                  Start tracking time to see your work sessions here.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="w-3/4 flex flex-col justify-start items-center pt-24">
            <div className="flex items-center justify-center">
              <div className="flex flex-col justify-center items-center text-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Plan Your Work</h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">Select a project from the sidebar to get started, or create a new one.</p>
                
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 max-w-4xl w-full">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Time Summary</h3>
                  
                  {isSummariesLoading ? (
                    <p className="text-gray-600 dark:text-gray-400">Loading time summaries...</p>
                  ) : (timeSummaries as any[]).length > 0 ? (
                    <div className="space-y-6">
                      {/* Time period headers */}
                      <div className="grid grid-cols-4 gap-4 pb-2 border-b border-gray-200 dark:border-gray-600">
                        <div className="font-medium text-gray-900 dark:text-gray-100">Project</div>
                        <div className="font-medium text-gray-900 dark:text-gray-100 text-center">Today</div>
                        <div className="font-medium text-gray-900 dark:text-gray-100 text-center">This Week</div>
                        <div className="font-medium text-gray-900 dark:text-gray-100 text-center">This Month</div>
                      </div>
                      
                      {/* Project rows */}
                      {(timeSummaries as any[]).map((summary) => (
                        <div key={summary.project.id} className="grid grid-cols-4 gap-4 py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                          <div className="flex items-center">
                            <div 
                              className="w-4 h-4 rounded-full mr-3"
                              style={{ backgroundColor: summary.project.color }}
                            ></div>
                            <span className="text-gray-900 dark:text-gray-100 font-medium">
                              {summary.project.name}
                            </span>
                          </div>
                          <div className="text-center text-gray-600 dark:text-gray-400">
                            {summary.today > 0 ? `${summary.today}m` : '-'}
                          </div>
                          <div className="text-center text-gray-600 dark:text-gray-400">
                            {summary.thisWeek > 0 ? `${summary.thisWeek}m` : '-'}
                          </div>
                          <div className="text-center text-gray-600 dark:text-gray-400">
                            {summary.thisMonth > 0 ? `${summary.thisMonth}m` : '-'}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-600 dark:text-gray-400 mb-4">No time tracked yet this month.</p>
                      <p className="text-gray-500 dark:text-gray-500 text-sm">
                        Start tracking time on your projects to see summaries here.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
        </div>
      )}
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={<div className="flex h-full items-center justify-center">Loading...</div>}>
      <PlanPageContent />
    </Suspense>
  );
}
