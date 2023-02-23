import React from 'react';

const Loading = ({ textInput = '' }) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
      <div
        style={{
          display: 'flex',
          marginLeft: '0.25rem',
          color: '#ffffff',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <svg
          fill="none"
          style={{ width: '2rem', height: '2rem' }}
          className="w-8 h-8 animate-spin"
          viewBox="0 0 32 32"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            clipRule="evenodd"
            d="M15.165 8.53a.5.5 0 01-.404.58A7 7 0 1023 16a.5.5 0 011 0 8 8 0 11-9.416-7.874.5.5 0 01.58.404z"
            fill="currentColor"
            fillRule="evenodd"
          />
        </svg>

        <div style={{ fontSize: '1.25rem', lineHeight: '1.75rem' }} className="text-xl">
          {textInput}
        </div>
      </div>
    </div>
  );
};

export default Loading;
