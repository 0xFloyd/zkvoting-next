import React from 'react';
import styles from './Button.module.css';

const Button = ({ text, className, disabled, onClick }) => {
  return (
    <button
      className={`btn glass shiny rounded-md px-4 py-1.5 hover:cursor-pointer  ${className} ${styles.shiny}`}
      disabled={disabled}
      onClick={onClick}
    >
      {text}
    </button>
  );
};

export default Button;

// <a href="#_" class="relative px-6 py-3 font-bold text-white rounded-lg group">
// <span class="absolute inset-0 w-full h-full transition duration-300 transform -translate-x-1 -translate-y-1 bg-purple-800 ease opacity-80 group-hover:translate-x-0 group-hover:translate-y-0"></span>
// <span class="absolute inset-0 w-full h-full transition duration-300 transform translate-x-1 translate-y-1 bg-pink-800 ease opacity-80 group-hover:translate-x-0 group-hover:translate-y-0 mix-blend-screen"></span>
// <span class="relative">Button Text</span>
// </a>
