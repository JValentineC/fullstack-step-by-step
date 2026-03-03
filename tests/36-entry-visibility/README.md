# Test Plan -- Step 36: Entry Visibility

## New Concept: Testing Enum-Driven UI

Step 36 introduces a **visibility selector** to the entry form and
**conditional badges** on entry cards. This is a great pattern for testing
enum-driven features -- when the UI changes based on a small set of known
values (PUBLIC, FRIENDS, PRIVATE).

### Testing the Visibility Selector

```tsx
// -- Render the form and verify the selector exists
render(<EntryForm onSubmit={vi.fn()} />);

// The visibility select defaults to PUBLIC
const select = screen.getByLabelText(/visibility/i);
expect(select).toHaveValue('PUBLIC');

// Change to PRIVATE
await user.selectOptions(select, 'PRIVATE');
expect(select).toHaveValue('PRIVATE');
```

### Testing That onSubmit Receives Visibility

```tsx
// -- Visibility is the 5th argument passed to onSubmit
const handleSubmit = vi.fn();
render(<EntryForm onSubmit={handleSubmit} />);

// Fill in required fields
await user.type(screen.getByLabelText(/title/i), 'My Entry');
await user.type(screen.getByLabelText(/content/i), 'Some content');

// Set visibility to FRIENDS
await user.selectOptions(screen.getByLabelText(/visibility/i), 'FRIENDS');

// Submit
await user.click(screen.getByRole('button', { name: /save entry/i }));

// Verify onSubmit was called with the visibility value
expect(handleSubmit).toHaveBeenCalledWith(
  'My Entry',
  'Some content',
  'neutral',         // default mood
  [],                // no tags
  'FRIENDS'          // <-- the visibility we selected
);
```

### Testing Edit Mode -- Pre-Filled Visibility

```tsx
// -- When editing an entry, the form starts with the entry's visibility
render(
  <EntryForm
    initial={{
      title: 'Old Title',
      content: 'Old Content',
      mood: 'happy',
      tags: 'react, forms',
      visibility: 'PRIVATE',
    }}
    onSubmit={vi.fn()}
    submitLabel="Update Entry"
  />
);

// The select is pre-filled with PRIVATE
expect(screen.getByLabelText(/visibility/i)).toHaveValue('PRIVATE');
```

### Testing Visibility Icons on EntryCard

```tsx
// -- PUBLIC entries show no visibility badge
render(<EntryCard entry={{ ...mockEntry, visibility: 'PUBLIC' }} />);
expect(screen.queryByText(/private/i)).not.toBeInTheDocument();
expect(screen.queryByText(/friends/i)).not.toBeInTheDocument();

// -- PRIVATE entries show a lock badge
render(<EntryCard entry={{ ...mockEntry, visibility: 'PRIVATE' }} />);
expect(screen.getByText(/private/i)).toBeInTheDocument();
expect(screen.getByTitle('Private')).toBeInTheDocument();

// -- FRIENDS entries show a people badge
render(<EntryCard entry={{ ...mockEntry, visibility: 'FRIENDS' }} />);
expect(screen.getByText(/friends/i)).toBeInTheDocument();
expect(screen.getByTitle('Friends only')).toBeInTheDocument();
```

### Testing the Backend -- Visibility in POST

```ts
// -- POST /api/entries includes visibility in the INSERT
const res = await request(app)
  .post('/api/entries')
  .set('Authorization', `Bearer ${token}`)
  .send({
    title: 'Private thought',
    summary: 'Just for me',
    mood: 'curious',
    tags: 'personal',
    visibility: 'PRIVATE',
  });

expect(res.status).toBe(201);
expect(res.body.visibility).toBe('PRIVATE');
```

### Testing the Backend -- Invalid Visibility Falls Back to PUBLIC

```ts
// -- Sending a bogus visibility value falls back to PUBLIC
const res = await request(app)
  .post('/api/entries')
  .set('Authorization', `Bearer ${token}`)
  .send({
    title: 'Test',
    summary: 'Body',
    mood: 'happy',
    visibility: 'INVALID_VALUE',  // not in the whitelist
  });

expect(res.status).toBe(201);
expect(res.body.visibility).toBe('PUBLIC');  // server defaults to PUBLIC
```

### Testing the Backend -- PUT Updates Visibility

```ts
// -- PUT can change visibility on an existing entry
const res = await request(app)
  .put(`/api/entries/${entryId}`)
  .set('Authorization', `Bearer ${token}`)
  .send({
    title: 'Updated',
    summary: 'Updated body',
    mood: 'happy',
    tags: '',
    visibility: 'FRIENDS',
  });

expect(res.status).toBe(200);
expect(res.body.visibility).toBe('FRIENDS');
```

---

## Manual Testing Checklist

| # | Step | Expected Result | Pass? |
|----|------|-----------------|-------|
| 1 | Open entry form | Visibility dropdown visible, defaults to "Public" | [ ] |
| 2 | Select "Private" | Dropdown changes to "Private -- only you" | [ ] |
| 3 | Select "Friends" | Dropdown changes to "Friends -- friends only" | [ ] |
| 4 | Create entry as PRIVATE | Entry appears with lock badge on card | [ ] |
| 5 | Create entry as FRIENDS | Entry appears with people badge on card | [ ] |
| 6 | Create entry as PUBLIC | No visibility badge shown | [ ] |
| 7 | Edit a PRIVATE entry | Form pre-selects "Private" | [ ] |
| 8 | Change visibility on edit | Badge updates after save | [ ] |
| 9 | Check network tab on POST | Request body includes `visibility` field | [ ] |
| 10 | Check network tab on PUT | Request body includes `visibility` field | [ ] |
| 11 | `npm run build` | 0 errors | [ ] |

---

## What's Next

Step 37 builds the **friendships backend** -- friend request, accept,
reject, and list endpoints. That's where the "Friends" visibility option
will start to actually matter!
