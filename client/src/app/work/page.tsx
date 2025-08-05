'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import ProjectSidebar from '@/components/ProjectSidebar';
import { useActiveProjects } from '@/hooks/useProjects';
import { useActiveTimeEntry, useLastTimeEntry } from '@/hooks/useTimeEntries';
import { useDailyQuote } from '@/hooks/useDailyQuote';

// Helper function to format duration in a human-readable way
const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}m`;
  } else if (minutes < 1440) { // Less than 24 hours
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${remainingMinutes}m`;
  } else { // 24 hours or more
    const days = Math.floor(minutes / 1440);
    const remainingHours = Math.floor((minutes % 1440) / 60);
    const remainingMinutes = minutes % 60;
    
    let result = `${days}d`;
    if (remainingHours > 0) {
      result += ` ${remainingHours}h`;
    }
    if (remainingMinutes > 0 && remainingHours === 0) {
      result += ` ${remainingMinutes}m`;
    }
    return result;
  }
};

function WorkPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [workDescription, setWorkDescription] = useState('');
  const [currentTime, setCurrentTime] = useState(Date.now());
  
  const selectedProjectId = searchParams.get('project');

  // Fetch projects query
  const {
    data: projects = [],
    isLoading,
    error
  } = useActiveProjects();

  // Fetch active time entry query
  const {
    data: activeTimeEntryData
  } = useActiveTimeEntry();

  // Fetch last time entry for selected project
  const {
    data: lastTimeEntry
  } = useLastTimeEntry(selectedProjectId);

  // Fetch daily quote
  const {
    data: dailyQuote,
    isLoading: isQuoteLoading
  } = useDailyQuote();

  const activeTimeEntry = activeTimeEntryData;
  const isTracking = !!activeTimeEntry;

  // Mutations
  const updateTimeEntryMutation = useMutation({
    mutationFn: async ({ id, endTime, description }: { id: string; endTime: string; description: string }) => {
      const response = await fetch(`/api/time-entries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endTime, description })
      });
      if (!response.ok) {
        throw new Error('Failed to update time entry');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeTimeEntry'] });
    }
  });

  const createTimeEntryMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const response = await fetch('/api/time-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId })
      });
      if (!response.ok) {
        throw new Error('Failed to start time tracking');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeTimeEntry'] });
    }
  });

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

  // Update work description and current time when active time entry changes
  useEffect(() => {
    if (activeTimeEntry) {
      setWorkDescription(activeTimeEntry.description || '');
      setCurrentTime(Date.now()); // Update current time immediately
    } else {
      setWorkDescription('');
    }
  }, [activeTimeEntry]);

  // Set up timer to update current time every minute when tracking
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTracking && activeTimeEntry) {
      // Update immediately when tracking starts
      setCurrentTime(Date.now());
      
      interval = setInterval(() => {
        setCurrentTime(Date.now());
      }, 1000); // Update every second
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isTracking, activeTimeEntry]);

  // Handle window close/refresh - stop tracking session
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (activeTimeEntry) {
        // Use fetch with keepalive for reliable data sending during page unload
        try {
          fetch(`/api/time-entries/${activeTimeEntry.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              endTime: new Date().toISOString(),
              description: workDescription
            }),
            keepalive: true
          }).catch(error => {
            console.error('Failed to stop tracking session:', error);
          });
        } catch (error) {
          console.error('Failed to stop tracking session:', error);
        }
        
        // Show confirmation dialog
        event.preventDefault();
        event.returnValue = 'You have an active time tracking session. Are you sure you want to leave?';
        return event.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [activeTimeEntry, workDescription]);
  
  const handleProjectSelect = async (projectId: string) => {
    try {
      // If there's an active time entry, end it first and save the description
      if (activeTimeEntry) {
        await updateTimeEntryMutation.mutateAsync({
          id: activeTimeEntry.id,
          endTime: new Date().toISOString(),
          description: workDescription
        });
      }

      // If clicking the same project that's already active, just stop tracking
      if (activeTimeEntry && activeTimeEntry.projectId === projectId) {
        setWorkDescription('');
        // Set URL to show the project as selected (not tracking)
        const params = new URLSearchParams(searchParams.toString());
        params.set('project', projectId);
        router.push(`/work?${params.toString()}`);
        return;
      }

      // Start new time entry for the selected project
      await createTimeEntryMutation.mutateAsync(projectId);
      setWorkDescription('');

      // Update URL to reflect selected project
      const params = new URLSearchParams(searchParams.toString());
      params.set('project', projectId);
      router.push(`/work?${params.toString()}`);
    } catch (err) {
      console.error('Error handling project selection:', err);
    }
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newDescription = e.target.value;
    setWorkDescription(newDescription);
  };

  const handleProjectDelete = async (projectId: string) => {
    try {
      await deleteProjectMutation.mutateAsync(projectId);
      
      if (selectedProjectId === projectId) {
        const params = new URLSearchParams(searchParams.toString());
        params.delete('project');
        router.push(`/work?${params.toString()}`);
      }
    } catch (err) {
      console.error('Error deleting project:', err);
    }
  };

  const selectedProjectData = selectedProjectId
    ? projects.find(p => p.id === selectedProjectId) || (activeTimeEntry?.project)
    : null;

  return (
    <div className="flex h-full min-h-0">
      <ProjectSidebar 
        projects={projects}
        selectedProjectId={selectedProjectId}
        onProjectSelect={handleProjectSelect}
        onProjectDelete={handleProjectDelete}
        isLoading={isLoading}
        error={error?.message || null}
        title="Work"
        showNewProjectButton={false}
        showDeleteButton={false}
      />
      
      {selectedProjectData ? (
        <div className="flex-1 p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">{selectedProjectData.name}</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{selectedProjectData.description}</p>
          
          {activeTimeEntry && activeTimeEntry.projectId === selectedProjectId ? (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Active Work Session</h2>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">Tracking</span>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Started at
                  </label>
                  <p className="text-gray-900 dark:text-gray-100">
                    {new Date(activeTimeEntry.startTime).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Duration
                  </label>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {formatDuration(Math.floor((currentTime - new Date(activeTimeEntry.startTime).getTime()) / (1000 * 60)))}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    What are you working on?
                  </label>
                  <textarea
                    value={workDescription}
                    onChange={handleDescriptionChange}
                    placeholder="Describe what you're working on..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    rows={3}
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Description will be saved when you change projects or stop tracking
                  </p>
                </div>
                <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                  <button
                    onClick={() => handleProjectSelect(activeTimeEntry.projectId)}
                    className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30"
                  >
                    Stop Tracking
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Project Overview</h2>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Not Tracking</span>
                </div>
              </div>
              <div className="space-y-4">
                {lastTimeEntry && lastTimeEntry.endTime ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Last Session
                    </label>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {formatDuration(lastTimeEntry.duration || 0)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Completed {new Date(lastTimeEntry.endTime).toLocaleString()}
                    </p>
                    {lastTimeEntry.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        "{lastTimeEntry.description}"
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">
                    No previous sessions found for this project.
                  </p>
                )}
                <p className="text-gray-600 dark:text-gray-400">
                  Ready to start working on this project. Click "Start Tracking" to begin a new work session.
                </p>
                <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                  <button
                    onClick={() => handleProjectSelect(selectedProjectId!)}
                    className="px-4 py-2 text-sm font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md hover:bg-green-100 dark:hover:bg-green-900/30"
                  >
                    Start Tracking
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="w-3/4 flex flex-col justify-start items-center pt-24">
          <div className="flex items-center justify-center">
            <div className="flex flex-col justify-center items-center text-center">
              {isQuoteLoading ? (
                <>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Ready to Work</h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">Loading inspiration...</p>
                </>
              ) : dailyQuote ? (
                <>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">"{(dailyQuote as any).quote}"</h1>
                  {(dailyQuote as any).author && (
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                      — {(dailyQuote as any).author}
                    </p>
                  )}
                </>
              ) : (
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Ready to Work</h1>
              )}
              <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 max-w-md">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Start Working</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Choose an active project to begin tracking your time. Only active projects are shown 
                  in the sidebar to help you focus on current work.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WorkPage() {
  return (
    <Suspense fallback={<div className="flex h-full items-center justify-center">Loading...</div>}>
      <WorkPageContent />
    </Suspense>
  );
}
