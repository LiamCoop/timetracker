import { useQuery } from '@tanstack/react-query';

interface WeeklyTimeData {
  day: string;
  date: string;
  minutes: number;
}

export function useWeeklyTime(projectId: string | null) {
  return useQuery<WeeklyTimeData[]>({
    queryKey: ['weeklyTime', projectId],
    queryFn: async () => {
      if (!projectId) {
        throw new Error('Project ID is required');
      }
      
      const response = await fetch(`/api/weekly-time?projectId=${projectId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch weekly time data');
      }
      return response.json();
    },
    enabled: !!projectId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
  });
}