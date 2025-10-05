import { useEffect, useState } from 'react';

export default function TestProxy() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testProxy = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/health');
        const data = await response.json();
        setResult(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Proxy test failed:', err);
      } finally {
        setLoading(false);
      }
    };

    testProxy();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Proxy Test</h1>
      {loading && <p>Testing proxy connection...</p>}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error: {error}</p>
        </div>
      )}
      {result && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <p>Success! Proxy is working.</p>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}