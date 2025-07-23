'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProjectSidebar from '@/components/ProjectSidebar';

interface Project {
  id: string;
  name: string;
  description: string | null;
  color: string;
  isActive: boolean;
}

interface TimeEntry {
  id: string;
  startTime: string;
  endTime: string | null;
  description: string | null;
  duration: number | null;
  projectId: string;
  project: Project;
}

export default function WorkPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTimeEntry, setActiveTimeEntry] = useState<TimeEntry | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  
  const selectedProjectId = searchParams.get('project');

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/projects');
      
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      
      const data = await response.json();
      setProjects(data.filter((project: Project) => project.isActive));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchActiveTimeEntry = async () => {
    try {
      const response = await fetch('/api/time-entries?active=true');
      
      if (!response.ok) {
        if (response.status === 404) {
          setActiveTimeEntry(null);
          return;
        }
        throw new Error('Failed to fetch active time entry');
      }
      
      const data = await response.json();
      if (data.length > 0) {
        setActiveTimeEntry(data[0]);
        setIsTracking(true);
      } else {
        setActiveTimeEntry(null);
        setIsTracking(false);
      }
    } catch (err) {
      console.error('Error fetching active time entry:', err);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchActiveTimeEntry();
  }, []);
  
  const handleProjectSelect = async (projectId: string) => {
    try {
      // If there's an active time entry, end it first
      if (activeTimeEntry) {
        await fetch(`/api/time-entries/${activeTimeEntry.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            endTime: new Date().toISOString()
          })
        });
      }

      // If clicking the same project that's already active, just stop tracking
      if (activeTimeEntry && activeTimeEntry.projectId === projectId) {
        setActiveTimeEntry(null);
        setIsTracking(false);
        const params = new URLSearchParams(searchParams.toString());
        params.delete('project');
        router.push(`/work?${params.toString()}`);
        return;
      }

      // Start new time entry for the selected project
      const response = await fetch('/api/time-entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: projectId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to start time tracking');
      }

      const newTimeEntry = await response.json();
      setActiveTimeEntry(newTimeEntry);
      setIsTracking(true);

      // Update URL to reflect selected project
      const params = new URLSearchParams(searchParams.toString());
      params.set('project', projectId);
      router.push(`/work?${params.toString()}`);
    } catch (err) {
      console.error('Error handling project selection:', err);
      setError(err instanceof Error ? err.message : 'Failed to handle time tracking');
    }
  };

  const handleProjectDelete = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete project');
      }
      
      await fetchProjects();
      
      if (selectedProjectId === projectId) {
        const params = new URLSearchParams(searchParams.toString());
        params.delete('project');
        router.push(`/work?${params.toString()}`);
      }
    } catch (err) {
      console.error('Error deleting project:', err);
    }
  };

  const selectedProjectData = activeTimeEntry 
    ? projects.find(p => p.id === activeTimeEntry.projectId) || activeTimeEntry.project
    : null;

  return (
    <div className="flex h-full">
      <ProjectSidebar 
        projects={projects}
        selectedProjectId={activeTimeEntry?.projectId || null}
        onProjectSelect={handleProjectSelect}
        onProjectDelete={handleProjectDelete}
        isLoading={isLoading}
        error={error}
        title="Work"
        showNewProjectButton={false}
        showDeleteButton={false}
      />
      
      {selectedProjectData && activeTimeEntry ? (
        <div className="flex-1 p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">{selectedProjectData.name}</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{selectedProjectData.description}</p>
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
                  {Math.floor((Date.now() - new Date(activeTimeEntry.startTime).getTime()) / (1000 * 60))} minutes
                </p>
              </div>
              {activeTimeEntry.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <p className="text-gray-900 dark:text-gray-100">{activeTimeEntry.description}</p>
                </div>
              )}
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
        </div>
      ) : (
        <div className="w-3/4 flex flex-col justify-start items-center pt-24">
          <div className="flex items-center justify-center">
            <div className="flex flex-col justify-center items-center text-center">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Ready to Work</h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">Select an active project from the sidebar to start tracking your work.</p>
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
