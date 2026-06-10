import React, { useEffect, useState, useRef } from 'react';
import './InteractiveCursor.css';

export default function InteractiveCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [trail, setTrail] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const canvasRef = useRef(null);
  const sparklesRef = useRef([]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseDown = () => setIsClicked(true);
    const handleMouseUp = () => setIsClicked(false);

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    // Event delegation for element hovers
    const handleMouseOver = (e) => {
      const target = e.target;
      if (!target) return;
      
      const isInteractive = 
        target.tagName === 'BUTTON' || 
        target.tagName === 'A' || 
        target.tagName === 'SELECT' || 
        target.tagName === 'INPUT' || 
        target.closest('a') || 
        target.closest('button') ||
        target.closest('.card') ||
        target.closest('.segment-btn') ||
        target.closest('.pill-radio-label') ||
        target.closest('.theme-selector-btn') ||
        target.closest('.diet-card') ||
        target.closest('.month-selector-wrapper') ||
        target.closest('.chat-send-btn') ||
        target.closest('.suggestion-chip') ||
        target.closest('.bubble-action-btn') ||
        target.closest('.widget-quick-queries button') ||
        target.closest('.widget-bubble-action');

      setIsHovered(!!isInteractive);
    };

    document.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  // Spring trail physics (delayed ring follower)
  useEffect(() => {
    let requestRef;
    const animateTrail = () => {
      setTrail((prev) => {
        const dx = position.x - prev.x;
        const dy = position.y - prev.y;
        return {
          x: prev.x + dx * 0.16,
          y: prev.y + dy * 0.16
        };
      });
      requestRef = requestAnimationFrame(animateTrail);
    };
    requestRef = requestAnimationFrame(animateTrail);
    return () => cancelAnimationFrame(requestRef);
  }, [position]);

  // Particle sparkles canvas loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Spawn sparkle particles on movement
      if (isVisible && Math.random() < 0.15) {
        sparklesRef.current.push({
          x: position.x + (Math.random() - 0.5) * 8,
          y: position.y + (Math.random() - 0.5) * 8,
          size: Math.random() * 2 + 1,
          color: Math.random() > 0.4 ? 'rgba(46, 204, 113, 0.5)' : 'rgba(168, 230, 207, 0.4)',
          speedX: (Math.random() - 0.5) * 0.8,
          speedY: (Math.random() - 0.5) * 0.8 - 0.4, // floats upwards
          alpha: 1,
          decay: Math.random() * 0.02 + 0.015
        });
      }

      // Draw and decay sparkles
      for (let i = sparklesRef.current.length - 1; i >= 0; i--) {
        const sparkle = sparklesRef.current[i];
        sparkle.x += sparkle.speedX;
        sparkle.y += sparkle.speedY;
        sparkle.alpha -= sparkle.decay;

        if (sparkle.alpha <= 0) {
          sparklesRef.current.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(sparkle.x, sparkle.y, sparkle.size, 0, Math.PI * 2);
        ctx.fillStyle = sparkle.color;
        ctx.globalAlpha = sparkle.alpha;
        ctx.shadowBlur = 3;
        ctx.shadowColor = '#2ECC71';
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, [position, isVisible]);

  if (!isVisible) return null;

  return (
    <>
      {/* Canvas layer for mouse trail sparkles */}
      <canvas ref={canvasRef} className="cursor-canvas" />

      {/* Core pinpoint pointer dot */}
      <div 
        className={`custom-cursor-dot ${isHovered ? 'hover' : ''} ${isClicked ? 'click' : ''}`}
        style={{ left: `${position.x}px`, top: `${position.y}px` }}
      />

      {/* Lagging ring element */}
      <div 
        className={`custom-cursor-ring ${isHovered ? 'hover' : ''} ${isClicked ? 'click' : ''}`}
        style={{ left: `${trail.x}px`, top: `${trail.y}px` }}
      />
    </>
  );
}
