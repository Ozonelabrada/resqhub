import { useState, useEffect } from 'react';
import { validateEmail, validatePassword } from '../utils/validation';

export function useSignInForm() {
  const [formData, setFormData] = useState({ email: '', password: '', rememberMe: false });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    setIsFormValid(validateEmail(formData.email) && validatePassword(formData.password));
  }, [formData]);

  const handleInputChange = (name: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    // ...validation logic here...
  };

  return { formData, setFormData, errors, setErrors, isFormValid, handleInputChange };
}