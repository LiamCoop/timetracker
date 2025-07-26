import { useQuery } from '@tanstack/react-query';

interface TimeSummary {
  project: {
    id: string;
    name: string;
    color: string;
  };
  today: number;
  thisWeek: number;
  thisMonth: number;
}

export function useTimeSummaries() {
  return useQuery<TimeSummary[]>({
    queryKey: ['timeSummaries'],
    queryFn: async () => {
      const response = await fetch('/api/time-summaries');
      if (!response.ok) {
        throw new Error('Failed to fetch time summaries');
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
  });
}