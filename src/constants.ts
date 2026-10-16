// This file exports ONLY runtime values (no TypeScript types/interfaces)
// Types are defined inline in each file that needs them due to Vite 8 + verbatimModuleSyntax requirements

export const API_BASE = (import.meta.env.VITE_API_BASE as string | undefined) || 'https://render72.pages.dev/api/test/events'

