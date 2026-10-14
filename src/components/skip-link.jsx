import React from 'react';
import { skipLink } from '../constants/class-names';

export const SkipLink = () => {
  const handleSkipContent = (event) => {
    event.preventDefault();
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
      window.scrollTo(0, mainContent.offsetTop);
      window.history.pushState(null, '', '#main-content');
    }
  };

  return (
    <a href="#main-content" className={skipLink} onClick={handleSkipContent}>
      Skip to main content
    </a>
  );
}