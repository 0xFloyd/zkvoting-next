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
