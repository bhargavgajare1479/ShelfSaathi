import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { App } from '../app/App'

describe('App Smoke Test', () => {
  it('renders application brand and authentication view when unauthenticated', async () => {
    render(<App />)
    expect(await screen.findByText('ShelfSaathi')).toBeInTheDocument()
    expect(screen.getByText('Email address')).toBeInTheDocument()
    expect(screen.getByText('Sign In')).toBeInTheDocument()
  })
})
