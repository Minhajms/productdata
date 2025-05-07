import { useEffect, useRef, useState } from 'react';

type AnimationOptions = {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  animationClass?: string;
};

export function useScrollAnimation<T extends HTMLElement>(options: AnimationOptions = {}) {
  const {
    threshold = 0.1,
    rootMargin = '0px',
    triggerOnce = true,
    animationClass = 'visible'
  } = options;
  
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const currentRef = ref.current;
    if (!currentRef) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            currentRef.classList.add(animationClass);
            if (triggerOnce) {
              observer.unobserve(currentRef);
            }
          } else if (!triggerOnce) {
            setIsVisible(false);
            currentRef.classList.remove(animationClass);
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );
    
    observer.observe(currentRef);
    
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold, rootMargin, triggerOnce, animationClass]);
  
  return { ref, isVisible };
}

export function useParallaxEffect<T extends HTMLElement>(options: { 
  speed?: number; 
  direction?: 'up' | 'down' | 'left' | 'right';
  maxOffset?: number;
}) {
  const {
    speed = 0.2,
    direction = 'up',
    maxOffset = 50
  } = options;
  
  const ref = useRef<T>(null);
  
  useEffect(() => {
    const currentRef = ref.current;
    if (!currentRef) return;
    
    const handleScroll = () => {
      if (!currentRef) return;
      
      const scrollTop = window.scrollY;
      const elementTop = currentRef.getBoundingClientRect().top + scrollTop;
      const relativeScroll = scrollTop - elementTop;
      
      // Calculate the parallax offset but don't exceed maxOffset
      let offset = Math.min(relativeScroll * speed, maxOffset);
      offset = Math.max(offset, -maxOffset); // Don't exceed negative maxOffset either
      
      // Apply transform based on direction
      let transform = '';
      switch (direction) {
        case 'up':
          transform = `translateY(${-offset}px)`;
          break;
        case 'down':
          transform = `translateY(${offset}px)`;
          break;
        case 'left':
          transform = `translateX(${-offset}px)`;
          break;
        case 'right':
          transform = `translateX(${offset}px)`;
          break;
      }
      
      currentRef.style.transform = transform;
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    // Run once on mount
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [speed, direction, maxOffset]);
  
  return { ref };
}

export function useHorizontalScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  
  useEffect(() => {
    const currentRef = ref.current;
    if (!currentRef) return;
    
    let isDown = false;
    let startX: number;
    let scrollLeft: number;
    
    const handleMouseDown = (e: MouseEvent) => {
      isDown = true;
      currentRef.classList.add('active');
      startX = e.pageX - currentRef.offsetLeft;
      scrollLeft = currentRef.scrollLeft;
    };
    
    const handleMouseLeave = () => {
      isDown = false;
      currentRef.classList.remove('active');
    };
    
    const handleMouseUp = () => {
      isDown = false;
      currentRef.classList.remove('active');
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - currentRef.offsetLeft;
      const walk = (x - startX) * 2; // Speed multiplier
      currentRef.scrollLeft = scrollLeft - walk;
    };
    
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      currentRef.scrollLeft += e.deltaY;
    };
    
    currentRef.addEventListener('mousedown', handleMouseDown);
    currentRef.addEventListener('mouseleave', handleMouseLeave);
    currentRef.addEventListener('mouseup', handleMouseUp);
    currentRef.addEventListener('mousemove', handleMouseMove);
    currentRef.addEventListener('wheel', handleWheel);
    
    return () => {
      currentRef.removeEventListener('mousedown', handleMouseDown);
      currentRef.removeEventListener('mouseleave', handleMouseLeave);
      currentRef.removeEventListener('mouseup', handleMouseUp);
      currentRef.removeEventListener('mousemove', handleMouseMove);
      currentRef.removeEventListener('wheel', handleWheel);
    };
  }, []);
  
  return { ref };
}