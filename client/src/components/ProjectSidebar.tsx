'use client';

import { useState } from 'react';
import NewProjectSheet from './NewProjectSheet';

interface Project {
  id: string;
  name: string;
  description: string | null;
  color: string;
  isActive: boolean;
}

interface ProjectSidebarProps {
  projects: Project[];
  selectedProjectId: string | null;
  onProjectSelect?: (projectId: string) => void;
  isLoading?: boolean;
  error?: string | null;
}

export default function ProjectSidebar({ 
  projects, 
  selectedProjectId, 
  onProjectSelect, 
  isLoading = false, 
  error = null 
}: ProjectSidebarProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleProjectClick = (projectId: string) => {
    onProjectSelect?.(projectId);
  };

  return (
    <div className="w-1/4 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Projects</h2>
          <NewProjectSheet 
            open={isSheetOpen} 
            onOpenChange={setIsSheetOpen}
            trigger={
              <button className="px-3 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-900">
                New Project
              </button>
            }
          />
        </div>
        
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 animate-pulse">
                <div className="flex items-start gap-3">
                  <div className="w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded mb-2" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-3/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {projects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => handleProjectClick(project.id)}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedProjectId === project.id
                      ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: project.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-medium truncate ${
                        selectedProjectId === project.id ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-gray-100'
                      }`}>
                        {project.name}
                      </h3>
                      {project.description && (
                        <p className={`text-sm mt-1 line-clamp-2 ${
                          selectedProjectId === project.id ? 'text-blue-700 dark:text-blue-200' : 'text-gray-600 dark:text-gray-400'
                        }`}>
                          {project.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {projects.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400 mb-4">No projects yet</p>
                <button className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30">
                  Create your first project
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
