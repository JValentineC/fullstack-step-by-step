// tests/36-entry-visibility/visibility.test.tsx
//
// Step 36 -- Entry Visibility
//
// This test file covers two features added in this step:
//   1. The visibility selector in EntryForm
//   2. The visibility badges on EntryCard
//
// Testing enum-driven UI is straightforward: render the component with
// each possible enum value and check the correct UI appears.
//
// Key concepts:
//   - selectOptions() to change a <select> value
//   - queryByText() returns null when an element is absent (no throw)
//   - getByTitle() matches the title attribute (useful for icon tooltips)
//   - toHaveValue() checks the current <select> value

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

// ---------- Lazy imports so tests degrade gracefully ----------
// If the learner hasn't built the components yet,
// the import will fail and the test names explain what's expected.
import EntryForm from '../../jvc-dev-log/src/components/EntryForm';
import EntryCard from '../../jvc-dev-log/src/components/EntryCard';
import type { Entry } from '../../jvc-dev-log/src/data/entries';

// ---------- Helpers -------------------------------------------
// A minimal entry object used by EntryCard tests.
// visibility will be overridden per test.
const baseMockEntry: Entry = {
  id: 1,
  title: 'Test Entry',
  summary: 'Some summary text',
  mood: 'happy',
  tags: ['react'],
  visibility: 'PUBLIC',
  createdAt: '2026-03-07T09:00:00.000Z',
  updatedAt: '2026-03-07T09:00:00.000Z',
  author: 'jv',
};

// ---------- EntryForm: Visibility Selector --------------------

describe('EntryForm -- visibility selector', () => {
  // This test checks that the selector exists and defaults to PUBLIC.
  it('renders a visibility select defaulting to PUBLIC', () => {
    render(<EntryForm onSubmit={vi.fn()} />);

    // getByLabelText matches the <label> text to the <select>
    const select = screen.getByLabelText(/visibility/i);
    expect(select).toBeInTheDocument();

    // toHaveValue checks the current value of a form element
    expect(select).toHaveValue('PUBLIC');
  });

  // This test proves the user can change the visibility.
  it('allows changing visibility to PRIVATE', async () => {
    const user = userEvent.setup();
    render(<EntryForm onSubmit={vi.fn()} />);

    const select = screen.getByLabelText(/visibility/i);

    // selectOptions fires a change event on the select element
    await user.selectOptions(select, 'PRIVATE');
    expect(select).toHaveValue('PRIVATE');
  });

  // This test proves the visibility value reaches the onSubmit callback.
  it('passes visibility as the 5th argument to onSubmit', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    render(<EntryForm onSubmit={handleSubmit} />);

    // Fill in the required fields so validation passes
    await user.type(screen.getByLabelText(/title/i), 'My Entry');
    await user.type(screen.getByLabelText(/content/i), 'Entry content');

    // Pick a non-default visibility
    await user.selectOptions(screen.getByLabelText(/visibility/i), 'FRIENDS');

    // Submit the form
    await user.click(screen.getByRole('button', { name: /save entry/i }));

    // onSubmit should be called once with (title, content, mood, tags, visibility)
    expect(handleSubmit).toHaveBeenCalledTimes(1);

    // Check the last (5th) argument is the visibility string
    const callArgs = handleSubmit.mock.calls[0];
    expect(callArgs[4]).toBe('FRIENDS');
  });

  // This test proves edit mode pre-fills the existing visibility.
  it('pre-fills visibility from initial prop in edit mode', () => {
    render(
      <EntryForm
        initial={{
          title: 'Old Title',
          content: 'Old Content',
          mood: 'happy',
          tags: 'react',
          visibility: 'PRIVATE',
        }}
        onSubmit={vi.fn()}
        submitLabel="Update Entry"
      />,
    );

    // The select should already show PRIVATE
    expect(screen.getByLabelText(/visibility/i)).toHaveValue('PRIVATE');
  });
});

// ---------- EntryCard: Visibility Badges ----------------------

describe('EntryCard -- visibility badges', () => {
  // PUBLIC entries should NOT show a visibility badge.
  // This keeps the UI clean -- public is the default, no extra info needed.
  it('shows no visibility badge for PUBLIC entries', () => {
    render(
      <MemoryRouter>
        <EntryCard entry={{ ...baseMockEntry, visibility: 'PUBLIC' }} />
      </MemoryRouter>,
    );

    // queryByText returns null instead of throwing if not found
    expect(screen.queryByText(/private/i)).not.toBeInTheDocument();
    // Use a function matcher to check for exact "Friends" badge text
    // (not "friends" in tag badges like "#friends")
    expect(screen.queryByTitle('Friends only')).not.toBeInTheDocument();
  });

  // PRIVATE entries show a lock badge with title="Private".
  it('shows a lock badge for PRIVATE entries', () => {
    render(
      <MemoryRouter>
        <EntryCard entry={{ ...baseMockEntry, visibility: 'PRIVATE' }} />
      </MemoryRouter>,
    );

    // The badge element has title="Private" for tooltip
    expect(screen.getByTitle('Private')).toBeInTheDocument();
  });

  // FRIENDS entries show a people badge with title="Friends only".
  it('shows a people badge for FRIENDS entries', () => {
    render(
      <MemoryRouter>
        <EntryCard entry={{ ...baseMockEntry, visibility: 'FRIENDS' }} />
      </MemoryRouter>,
    );

    // The badge element has title="Friends only"
    expect(screen.getByTitle('Friends only')).toBeInTheDocument();
  });
});
