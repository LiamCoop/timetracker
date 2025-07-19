'use client';

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
  const handleProjectClick = (projectId: string) => {
    onProjectSelect?.(projectId);
  };

  return (
    <div className="w-80 bg-gray-50 border-r border-gray-200 h-full">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Projects</h2>
          <button className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            New Project
          </button>
        </div>
        
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 rounded-lg border border-gray-200 bg-white animate-pulse">
                <div className="flex items-start gap-3">
                  <div className="w-4 h-4 rounded-full bg-gray-200 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="h-4 bg-gray-200 rounded mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-3/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100"
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
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: project.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-medium truncate ${
                        selectedProjectId === project.id ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        {project.name}
                      </h3>
                      {project.description && (
                        <p className={`text-sm mt-1 line-clamp-2 ${
                          selectedProjectId === project.id ? 'text-blue-700' : 'text-gray-600'
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
                <p className="text-gray-500 mb-4">No projects yet</p>
                <button className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100">
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