import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiService } from '@/lib/api';

const NLP: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loginWithNlpToken = async () => {
      const nlpSsoToken = searchParams.get('nlp_sso_token');

      if (!nlpSsoToken) {
        setError('No SSO token found in URL');
        toast.error('No SSO token found in URL');
        return;
      }

      try {
        const response = await apiService.nlpLogin(nlpSsoToken);
        if (response.token) {
          await refreshProfile();
          navigate('/');
        } else {
          throw new Error('No token received from server');
        }
      } catch (err: any) {
        console.error('NLP Login error:', err);
        setError(err.message || 'Failed to login via NLP');
        toast.error(err.message || 'Failed to login via NLP');
      }
    };

    loginWithNlpToken();
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-hero">
      <div className="w-full max-w-md p-8 space-y-6 text-center bg-white shadow-2xl rounded-2xl">
        {error ? (
          <>
            <h1 className="text-2xl font-bold text-red-600">Login Failed</h1>
            <p className="text-gray-600">{error}</p>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2 mt-4 font-medium text-white rounded-full bg-primary"
            >
              Go to Login
            </button>
          </>
        ) : (
          <>
            <Loader2 className="w-12 h-12 mx-auto text-primary animate-spin" />
            <h1 className="text-2xl font-bold">Logging you in...</h1>
            <p className="text-gray-600">Please wait while we verify your NLP session.</p>
          </>
        )}
      </div>
    </div>
  );
};

export default NLP;
