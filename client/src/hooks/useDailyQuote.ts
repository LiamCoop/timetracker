import { useQuery } from '@tanstack/react-query';

interface DailyQuote {
  id: string;
  quote: string;
  author: string | null;
  category: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export function useDailyQuote() {
  return useQuery<DailyQuote>({
    queryKey: ['dailyQuote'],
    queryFn: async () => {
      const response = await fetch('/api/daily-quotes');
      if (!response.ok) {
        throw new Error('Failed to fetch daily quote');
      }
      const dailyQuote: DailyQuote = await response.json();
      return dailyQuote;
    },
    staleTime: 1000 * 60 * 60, // 1 hour - keep quote fresh for the work session
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  });
}
