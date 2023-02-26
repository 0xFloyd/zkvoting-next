import React from 'react';

const Input = ({ label, type, placeholder, value, onChange }) => {
  const [focused, setFocused] = React.useState(false);
  const onFocus = () => setFocused(true);
  const onBlur = () => setFocused(false);

  return (
    <div className="mt-1 flex rounded-md">
      <span
        className={`transition-all text-gray inline-flex items-center rounded-l-md border-2  border-r-0 px-3 sm:text-sm ${
          focused ? 'border-PINK' : 'border-secondaryGray border-opacity-20'
        }`}
      >
        {label}
      </span>
      <input
        onFocus={onFocus}
        onBlur={onBlur}
        type={type}
        placeholder={placeholder}
        className="input input-bordered bg-transparent placeholder:italic placeholder:opacity-25 w-full rounded-l-none focus:outline-none border-2 focus:border-PINK"
        value={value}
        onChange={onChange}
      />
    </div>
  );
};

export default Input;
