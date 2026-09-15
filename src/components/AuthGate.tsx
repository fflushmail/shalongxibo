import React from 'react'

/**
 * AuthGate — pass-through component for 100% offline local storage mode.
 * All pages and learning modules are freely accessible without login.
 */
export default function AuthGate({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
