import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Card, 
  Button, 
  Logo 
} from '../../ui';
import { 
  Home, 
  ArrowLeft, 
  Search,
  AlertCircle
} from 'lucide-react';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 md:p-8">
      <Container size="sm">
        <div className="text-center mb-8">
          <Logo className="mx-auto mb-6 opacity-50 grayscale" />
        </div>

        <Card className="p-8 md:p-16 border-none shadow-2xl shadow-slate-200 rounded-[3rem] bg-white text-center relative overflow-hidden">
          {/* Decorative background element */}
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-slate-50 rounded-full blur-3xl opacity-50"></div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-slate-100 mb-8">
              <Search className="w-10 h-10 text-slate-400" />
            </div>

            <h1 className="text-8xl font-black text-slate-200 mb-4 tracking-tighter">404</h1>
            <h2 className="text-3xl font-black text-slate-800 mb-4">Page Not Found</h2>
            <p className="text-slate-500 text-lg mb-12 max-w-md mx-auto leading-relaxed">
              The page you're looking for doesn't exist or has been moved to another location.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                onClick={() => navigate('/')}
                className="w-full sm:w-auto px-8 py-6 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white shadow-xl shadow-teal-100 font-bold"
              >
                <Home className="w-5 h-5 mr-2" />
                Back to Home
              </Button>
              
              <Button
                variant="outline"
                onClick={() => window.history.back()}
                className="w-full sm:w-auto px-8 py-6 rounded-2xl border-slate-200 hover:bg-slate-50 text-slate-600 font-bold"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Go Back
              </Button>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-slate-50 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-300">
            <AlertCircle className="w-4 h-4" />
            ResQHub System Resource
          </div>
        </Card>
      </Container>
    </div>
  );
};

export default NotFoundPage;