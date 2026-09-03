import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import Page from '$routes/+page.svelte';

describe('overview page', () => {
  it('renders the Overview label', () => {
    render(Page);
    expect(screen.getByText('Overview')).toBeInTheDocument();
  });
});
