import { useState } from 'react';

const initialForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  zipCode: '',
};

const validators = {
  firstName: (v) => v.trim().length > 0 ? '' : 'First name is required',
  lastName: (v) => v.trim().length > 0 ? '' : 'Last name is required',
  email: (v) => {
    if (!v.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Enter a valid email';
    return '';
  },
  phone: (v) => {
    if (!v.trim()) return 'Phone number is required';
    const digits = v.replace(/\D/g, '');
    if (digits.length < 10) return 'Enter a valid 10-digit phone number';
    return '';
  },
  zipCode: (v) => {
    if (!v.trim()) return 'Zip code is required';
    if (!/^\d{5}$/.test(v.trim())) return 'Enter a valid 5-digit zip code';
    return '';
  },
};

function formatPhone(value) {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export default function ContactForm({ onSubmit, onBack }) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (field, value) => {
    if (field === 'phone') {
      value = formatPhone(value);
    }
    if (field === 'zipCode') {
      value = value.replace(/\D/g, '').slice(0, 5);
    }
    setForm((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      setErrors((prev) => ({ ...prev, [field]: validators[field](value) }));
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({ ...prev, [field]: validators[field](form[field]) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    let hasError = false;
    for (const field of Object.keys(validators)) {
      const error = validators[field](form[field]);
      if (error) hasError = true;
      newErrors[field] = error;
    }
    setErrors(newErrors);
    setTouched({ firstName: true, lastName: true, email: true, phone: true, zipCode: true });
    if (!hasError) {
      onSubmit({
        ...form,
        phone: form.phone.replace(/\D/g, ''),
      });
    }
  };

  const fields = [
    { key: 'firstName', label: 'First Name', type: 'text', autoComplete: 'given-name', placeholder: 'John' },
    { key: 'lastName', label: 'Last Name', type: 'text', autoComplete: 'family-name', placeholder: 'Smith' },
    { key: 'email', label: 'Email', type: 'email', autoComplete: 'email', placeholder: 'john@example.com' },
    { key: 'phone', label: 'Phone', type: 'tel', autoComplete: 'tel', placeholder: '(555) 123-4567' },
    { key: 'zipCode', label: 'Zip Code', type: 'text', autoComplete: 'postal-code', inputMode: 'numeric', placeholder: '90210' },
  ];

  return (
    <div className="px-6 py-8 max-w-md mx-auto">
      {/* Back button */}
      <button onClick={onBack} className="flex items-center gap-1 text-gray-400 text-sm mb-6 hover:text-gray-600 transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <h2 className="text-2xl font-bold text-spg-gray-dark mb-2">Tell us about yourself</h2>
      <p className="text-gray-400 mb-8">We&apos;ll use this to personalize your experience</p>

      <form onSubmit={handleSubmit} noValidate>
        <div className="space-y-4">
          {/* Name row */}
          <div className="grid grid-cols-2 gap-3">
            {fields.slice(0, 2).map((f) => (
              <div key={f.key}>
                <label htmlFor={f.key} className="block text-sm font-medium text-gray-600 mb-1.5">
                  {f.label}
                </label>
                <input
                  id={f.key}
                  type={f.type}
                  autoComplete={f.autoComplete}
                  placeholder={f.placeholder}
                  value={form[f.key]}
                  onChange={(e) => handleChange(f.key, e.target.value)}
                  onBlur={() => handleBlur(f.key)}
                  className={`input-field ${touched[f.key] && errors[f.key] ? 'input-error' : ''}`}
                />
                {touched[f.key] && errors[f.key] && (
                  <p className="text-red-500 text-xs mt-1">{errors[f.key]}</p>
                )}
              </div>
            ))}
          </div>

          {/* Other fields */}
          {fields.slice(2).map((f) => (
            <div key={f.key}>
              <label htmlFor={f.key} className="block text-sm font-medium text-gray-600 mb-1.5">
                {f.label}
              </label>
              <input
                id={f.key}
                type={f.type}
                autoComplete={f.autoComplete}
                inputMode={f.inputMode}
                placeholder={f.placeholder}
                value={form[f.key]}
                onChange={(e) => handleChange(f.key, e.target.value)}
                onBlur={() => handleBlur(f.key)}
                className={`input-field ${touched[f.key] && errors[f.key] ? 'input-error' : ''}`}
              />
              {touched[f.key] && errors[f.key] && (
                <p className="text-red-500 text-xs mt-1">{errors[f.key]}</p>
              )}
            </div>
          ))}
        </div>

        <button type="submit" className="btn-primary mt-8">
          Next — Take Your Selfie
        </button>
      </form>

      <p className="text-xs text-gray-400 text-center mt-6 leading-relaxed">
        Your information is private and will never be shared. By continuing, you agree to
        receive communications from SPG Dental Implants.
      </p>
    </div>
  );
}
