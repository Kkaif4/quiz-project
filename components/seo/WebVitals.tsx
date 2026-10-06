'use client'

import { useReportWebVitals } from 'next/web-vitals'

export function WebVitals() {
  useReportWebVitals((metric) => {
    // Only log in development or if a specific query param/localStorage flag is set for performance checking
    if (typeof window !== 'undefined' && (process.env.NODE_ENV === 'development' || localStorage.getItem('DEBUG_PERF') === 'true')) {
      if (metric.label === 'web-vital') {
        console.log(`[Web Vitals] ${metric.name}: ${Math.round(metric.value * 10) / 10} (rating: ${metric.rating})`);
      }
    }
  })
  
  return null
}
