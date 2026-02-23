import { useEffect, useState } from 'react';
import axios from 'axios';
import { getTherapistProfiles, apiUrl, baseApi } from '../utils/url';

export default function ApiDebug() {
  const [status, setStatus] = useState({});
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    const checkApi = async () => {
      try {
        const response = await axios.get(getTherapistProfiles + '?page=1&pageSize=1', {
          timeout: 5000
        });
        setStatus({
          status: 'SUCCESS',
          code: response.status,
          count: response.data?.data?.length || 0,
          url: getTherapistProfiles,
          apiUrl: apiUrl,
          baseApi: baseApi,
          timestamp: new Date().toLocaleTimeString()
        });
      } catch (error) {
        setStatus({
          status: 'ERROR',
          message: error.message,
          url: getTherapistProfiles,
          apiUrl: apiUrl,
          baseApi: baseApi,
          timestamp: new Date().toLocaleTimeString()
        });
      }
    };

    checkApi();
  }, []);

  if (!isClient || process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: 10,
      right: 10,
      background: status.status === 'SUCCESS' ? '#22c55e' : '#ef4444',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px',
      fontFamily: 'monospace'
    }}>
      <div><strong>API Status:</strong> {status.status}</div>
      <div>URL: {status.url?.substring(0, 50)}...</div>
      <div>Time: {status.timestamp}</div>
      {status.message && <div style={{ color: '#fca5a5' }}>{status.message}</div>}
      {status.code && <div>Code: {status.code}</div>}
    </div>
  );
}
