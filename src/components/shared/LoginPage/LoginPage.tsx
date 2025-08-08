import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';

import 'primeflex/primeflex.css';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const navigate = useNavigate();

  const handleLogin = () => {
    console.log({ email, password, remember });
    // add real auth later
    navigate('/admin/dashboard');
  };

  return (
    <div className="flex align-items-center justify-content-center min-h-screen bg-blue-100">
      <Card className="w-full sm:w-25rem shadow-3">
        <div className="text-center mb-4">
          <h2 className="text-blue-600">Welcome to ResQHub</h2>
          <p className="text-sm text-gray-600">Please log in to continue</p>
        </div>

        <div className="p-fluid">
          <div className="field mb-3">
            <label htmlFor="email">Email</label>
            <InputText
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full"
            />
          </div>

          <div className="field mb-3">
            <label htmlFor="password">Password</label>
            <Password
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              feedback={false}
              toggleMask
              className="w-full"
            />
          </div>

          <div className="flex justify-content-between align-items-center mb-4">
            <div className="flex align-items-center">
              <Checkbox inputId="remember" checked={remember} onChange={e => setRemember(e.checked ?? false)} />
              <label htmlFor="remember" className="ml-2">Remember me</label>
            </div>
            <a href="#" className="text-sm text-blue-600 hover:underline">Forgot password?</a>
          </div>

          <Button label="Login" icon="pi pi-sign-in" onClick={handleLogin} className="w-full" />
        </div>

        <p className="mt-4 text-center text-sm text-gray-500">
          Don’t have an account? <a href="#" className="text-blue-600 hover:underline">Sign up</a>
        </p>
      </Card>
    </div>
  );
};

export default LoginPage;
