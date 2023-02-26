import React from 'react';

const Input = ({ label, type, placeholder, value, onChange }) => {
  return (
    <div className="mt-1 flex rounded-md shadow-sm">
      <span className="inline-flex items-center rounded-l-md border-2  border-r-0 px-3 sm:text-sm">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        className="input input-bordered placeholder:italic placeholder:text-zinc-600 w-full max-w-xs rounded-l-none focus:outline-none border-2 focus:border-red-500"
        value={value}
        onChange={onChange}
      />
    </div>
  );
};

export default Input;
