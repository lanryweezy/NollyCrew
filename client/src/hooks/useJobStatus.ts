import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';

export type JobStatus = 'waiting' | 'active' | 'completed' | 'failed';

interface UseJobStatusOptions {
  intervalMs?: number;
  stopOn?: JobStatus[];
}

interface UseJobStatusState<T = any> {
  status: JobStatus | null;
  progress: number;
  result?: T;
  error?: string;
  loading: boolean;
}

export function useJobStatus<T = any>(jobId: string | null | undefined, options: UseJobStatusOptions = {}): UseJobStatusState<T> {
  const { intervalMs = 1500, stopOn = ['completed', 'failed'] } = options;
  const [state, setState] = useState<UseJobStatusState<T>>({ status: null, progress: 0, loading: !!jobId });
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!jobId) {
      setState({ status: null, progress: 0, loading: false });
      return;
    }

    let cancelled = false;

    const fetchStatus = async () => {
      try {
        const data = await api.getJobStatus(jobId);
        if (cancelled) return;
        const nextState: UseJobStatusState<T> = {
          status: data.status as JobStatus,
          progress: data.progress ?? 0,
          result: data.result as T | undefined,
          error: data.error,
          loading: !stopOn.includes(data.status as JobStatus),
        };
        setState(nextState);
        if (!stopOn.includes(data.status as JobStatus)) {
          timerRef.current = window.setTimeout(fetchStatus, intervalMs);
        }
      } catch (err: any) {
        if (cancelled) return;
        setState(prev => ({ ...prev, loading: false, error: err?.message || 'Failed to fetch job status' }));
      }
    };

    // initial kick
    setState(prev => ({ ...prev, loading: true }));
    fetchStatus();

    return () => {
      cancelled = true;
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [jobId, intervalMs, stopOn]);

  return state;
}



