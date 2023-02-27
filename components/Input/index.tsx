import React from 'react';

interface InputProps {
  label: string;
  type: string;
  placeholder: string | number;
  value: any;
  onChange?: any;
  disabled?: boolean;
}

const Input = ({ label, type, placeholder, value, onChange, disabled }: InputProps) => {
  const [focused, setFocused] = React.useState(false);
  const onFocus = () => setFocused(true);
  const onBlur = () => setFocused(false);

  return (
    <div className="mt-1 flex rounded-md w-full">
      <span
        className={`flex-shrink-0 transition-all text-gray inline-flex items-center rounded-l-md border-2  border-r-0 px-3 sm:text-sm ${
          focused ? 'border-PINK' : 'border-secondaryGray border-opacity-20'
        }`}
      >
        {label}
      </span>
      <input
        onFocus={onFocus}
        onBlur={onBlur}
        type={type}
        disabled={disabled}
        placeholder={placeholder.toString()}
        className="input input-bordered bg-transparent placeholder:italic placeholder:opacity-25 w-full rounded-l-none focus:outline-none border-2 focus:border-PINK"
        value={value}
        onChange={onChange}
      />
    </div>
  );
};

export default Input;
