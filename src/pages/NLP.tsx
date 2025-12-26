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
  }, [searchParams, navigate, refreshProfile]);

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 text-center space-y-6">
        {error ? (
          <>
            <h1 className="text-2xl font-bold text-red-600">Login Failed</h1>
            <p className="text-gray-600">{error}</p>
            <button
              onClick={() => navigate('/login')}
              className="mt-4 px-6 py-2 bg-primary text-white rounded-full font-medium"
            >
              Go to Login
            </button>
          </>
        ) : (
          <>
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
            <h1 className="text-2xl font-bold">Logging you in...</h1>
            <p className="text-gray-600">Please wait while we verify your NLP session.</p>
          </>
        )}
      </div>
    </div>
  );
};

export default NLP;
