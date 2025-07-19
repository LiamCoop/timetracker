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

export default function ProjectsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const selectedProjectId = searchParams.get('project');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/projects');
        
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }
        
        const data = await response.json();
        setProjects(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load projects');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);
  
  const handleProjectSelect = (projectId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('project', projectId);
    router.push(`/projects?${params.toString()}`);
  };

  const selectedProjectData = selectedProjectId 
    ? projects.find(p => p.id === selectedProjectId) 
    : null;

  return (
    <div className="flex h-full">
      <ProjectSidebar 
        projects={projects}
        selectedProjectId={selectedProjectId}
        onProjectSelect={handleProjectSelect}
        isLoading={isLoading}
        error={error}
      />
      
      <div className="flex-1 p-8">
        {selectedProjectData ? (
          <div>
            <h1 className="text-3xl font-bold mb-2">{selectedProjectData.name}</h1>
            <p className="text-gray-600 mb-6">{selectedProjectData.description}</p>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Time Entries</h2>
              <p className="text-gray-500">Time tracking interface will go here...</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Projects</h1>
              <p className="text-lg text-gray-600 mb-8">Select a project from the sidebar to get started, or create a new one.</p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 max-w-md">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Get Started</h3>
                <p className="text-gray-600 text-sm">
                  Projects help you organize your time tracking. Create projects for different clients, 
                  tasks, or areas of work to better understand where your time is spent.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
