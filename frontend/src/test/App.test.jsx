import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { App } from '../app/App'

describe('App Smoke Test', () => {
  it('renders application brand and store overview', () => {
    render(<App />)
    expect(screen.getByText('ShelfSaathi')).toBeInTheDocument()
    expect(screen.getByText('Store Overview')).toBeInTheDocument()
  })
})

