import { useQuery } from '@tanstack/react-query';

interface TimeEntry {
  id: string;
  projectId: string;
  startTime: string;
  endTime: string | null;
  description: string | null;
  project?: {
    id: string;
    name: string;
    description: string | null;
    color: string;
    isActive: boolean;
  };
}

export function useActiveTimeEntry() {
  return useQuery({
    queryKey: ['activeTimeEntry'],
    queryFn: async (): Promise<TimeEntry | null> => {
      const response = await fetch('/api/time-entries?active=true');
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to fetch active time entry');
      }
      
      const data = await response.json();
      return data.length > 0 ? data[0] : null;
    }
  });
}

export function useLastTimeEntry(projectId: string | null) {
  return useQuery({
    queryKey: ['lastTimeEntry', projectId],
    queryFn: async (): Promise<TimeEntry | null> => {
      if (!projectId) return null;
      
      const response = await fetch(`/api/time-entries?projectId=${projectId}&limit=1&completed=true`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to fetch last time entry');
      }
      
      const data = await response.json();
      return data.length > 0 ? data[0] : null;
    },
    enabled: !!projectId
  });
}