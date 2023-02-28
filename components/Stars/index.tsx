import React, { useEffect, useRef, useState } from 'react';

const Stars = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const elementRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (event) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    const x = (mousePosition.x - window.innerWidth / 2) / window.innerWidth;
    const y = (mousePosition.y - window.innerHeight / 2) / window.innerHeight;
    const rotateX = y * 1;
    const rotateY = x * 1;
    const translateX = x * -5;
    const translateY = y * -5;
    element.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateX(${translateX}px) translateY(${translateY}px)`;
  }, [mousePosition]);

  return <div className="stars" ref={elementRef} />;
};

export default Stars;
