import { useState, useEffect } from 'react';

const breakpoints = {
  xs: '(max-width:600px)',
  sm: '(max-width:600px)',
  md: '(max-width:960px)',
  lg: '(min-width:1280px)',
};

export function useMediaQueryClient(breakpoint) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const query = typeof breakpoint === 'string' ? breakpoints[breakpoint] : breakpoint;
    const mediaQuery = window.matchMedia(query);
    
    setMatches(mediaQuery.matches);

    const handleChange = (e) => setMatches(e.matches);
    
    mediaQuery.addListener(handleChange);

    return () => mediaQuery.removeListener(handleChange);
  }, [breakpoint]);

  return matches;
}
