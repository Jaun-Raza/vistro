"use client"
import { useState, useEffect } from "react";

const FloatingBackgroundElements = () => {
  const [elements, setElements] = useState([
    { id: 1, x: 5, y: 5, size: 450, color: 'bg-indigo-500', opacity: 'opacity-30', speed: { x: 0.5, y: 0.7 } },
    { id: 2, x: 70, y: 60, size: 350, color: 'bg-purple-500', opacity: 'opacity-20', speed: { x: 0.8, y: 0.4 } },
    { id: 3, x: 30, y: 70, size: 400, color: 'bg-blue-500', opacity: 'opacity-25', speed: { x: 0.6, y: 0.5 } },
    { id: 4, x: 80, y: 20, size: 300, color: 'bg-violet-500', opacity: 'opacity-15', speed: { x: 0.3, y: 0.9 } }
  ]);
  
  useEffect(() => {
    const moveInterval = setInterval(() => {
      setElements(prev => prev.map(element => {
        // Calculate new positions with boundaries
        let newX = element.x + element.speed.x * (Math.random() > 0.5 ? 1 : -1);
        let newY = element.y + element.speed.y * (Math.random() > 0.5 ? 1 : -1);
        
        // Keep within boundaries (with some padding)
        newX = Math.max(0, Math.min(90, newX));
        newY = Math.max(0, Math.min(90, newY));
        
        return {
          ...element,
          x: newX,
          y: newY
        };
      }));
    }, 2000);
    
    return () => clearInterval(moveInterval);
  }, []);
  
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      {elements.map(element => (
        <div
          key={element.id}
          className={`absolute rounded-full ${element.color} ${element.opacity} animate-pulse transition-all duration-1000 ease-in-out`}
          style={{
            width: `${element.size}px`,
            height: `${element.size}px`,
            left: `${element.x}%`,
            top: `${element.y}%`,
            transform: 'translate(-50%, -50%)'
          }}
        />
      ))}
    </div>
  );
};

export default FloatingBackgroundElements;