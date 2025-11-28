# Content Review System - Quick Start Guide

## Getting Started

### Activating Admin Mode

1. Navigate to any page on the site and add `?admin=true` to the URL
   - Example: `https://hablas.co/?admin=true`
   - Example: `https://hablas.co/recursos/1?admin=true`

2. Once activated, you'll see:
   - Yellow "Admin Mode Active" badge in top-right corner
   - Floating action button (gear icon) in bottom-right corner
   - "Edit Content" buttons on resource pages

3. Admin mode persists across pages using localStorage

### Deactivating Admin Mode

1. Click the floating action button (gear icon)
2. Click "Exit Admin Mode" at the bottom of the menu

## Admin Tools

### 1. Admin Dashboard

**Access**: `/admin` or via floating action button → "Dashboard"

**Features**:
- View all 59 resources with edit status
- See statistics:
  - Total resources
  - Pending edits
  - Approved edits
- Search resources by title/description
- Filter by:
  - Category (all, repartidor, conductor)
  - Level (basico, intermedio, avanzado)
  - Edit status (pending, approved, rejected)
- Click "Edit" to open editor for any resource

### 2. Content Editor

**Access**: `/review` or via floating action button → "Content Editor"

**Features**:
- Standalone demo editor
- Side-by-side comparison view
- Real-time diff highlighting
- Auto-save (2 seconds after typing stops)
- Manual save button

### 3. Resource Edit Page

**Access**: `/admin/edit/[id]` where [id] is the resource number

**How to Get There**:
- From Dashboard: Click "Edit" button on any resource
- From Resource Page: Click "Edit Content" button (admin mode only)
- From Floating Menu: "Edit This Resource" (when viewing a resource)

**Features**:
- Loads specific resource content automatically
- Original content in left panel (read-only)
- Editable content in right panel
- Toggle diff view to see changes
- Auto-save every 3 seconds
- Manual save button
- Navigate back to dashboard

## Keyboard Shortcuts

- **Ctrl+E** (Windows/Linux) or **Cmd+E** (Mac): Toggle admin menu
- **ESC**: Close admin menu

## Working with Resources

### Editing a Resource

1. **Navigate to the resource**:
   - Browse to dashboard at `/admin`
   - Find the resource you want to edit
   - Click "Edit" button

2. **Make your changes**:
   - Edit content in the right panel
   - Content auto-saves after 2-3 seconds
   - Or click "Save" button to save immediately
   - Watch for save status indicators:
     - "Saving..." (blue spinner)
     - "Saved" (green checkmark)
     - "Save failed" (red alert)

3. **Review changes**:
   - Click "Diff" button to see highlighted changes
   - Red = removed text
   - Green = added text
   - Click "Diff" again to return to side-by-side view

4. **Return to dashboard**:
   - Click "Back to Dashboard" link
   - Or use browser back button

### Quick Edit from Resource Page

1. **View any resource** (in admin mode)
2. **Click "Edit Content"** button in header
3. **Edit and save** as above
4. **Return** to resource or dashboard

## File Locations

### Created Files

All integration files are located in:

```
/app/admin/                         # Admin pages
  ├── page.tsx                      # Dashboard
  └── edit/[id]/page.tsx           # Edit page

/app/api/content/                   # API routes
  ├── list/route.ts                # List resources
  ├── [id]/route.ts                # Get content
  └── save/route.ts                # Save edits

/components/
  └── AdminNav.tsx                  # Floating admin menu

/lib/types/
  └── content-edits.ts             # TypeScript types

/data/
  └── content-edits.json           # Edit storage

/docs/
  ├── architecture/
  │   └── content-review-integration.md  # Full architecture
  └── admin-quick-start.md         # This guide
```

### Modified Files

```
/app/layout.tsx                     # Added AdminNav component
/app/recursos/[id]/ResourceDetail.tsx  # Added edit button
```

## Data Structure

### Edit Storage (`/data/content-edits.json`)

```json
{
  "edits": [
    {
      "id": "edit-unique-id",
      "resourceId": 1,
      "editedContent": "...",
      "status": "pending",
      "createdAt": "2025-11-17T00:00:00Z",
      "updatedAt": "2025-11-17T01:00:00Z"
    }
  ],
  "history": [
    {
      "id": "hist-unique-id",
      "contentEditId": "edit-unique-id",
      "content": "...",
      "timestamp": "2025-11-17T01:00:00Z"
    }
  ],
  "metadata": {
    "totalEdits": 1,
    "pendingEdits": 1,
    "approvedEdits": 0,
    "rejectedEdits": 0,
    "lastEditDate": "2025-11-17T01:00:00Z"
  }
}
```

## Common Tasks

### Task: Review All Pending Edits

1. Go to Dashboard (`/admin`)
2. Set status filter to "Pending"
3. Click through each "Edit" button
4. Review changes in diff view
5. Save or discard changes

### Task: Bulk Edit Similar Resources

1. Go to Dashboard (`/admin`)
2. Use search to find related resources
   - Example: Search "delivery" for all delivery-related content
3. Edit each resource in sequence
4. Use Next/Previous navigation or return to dashboard

### Task: Find Recently Edited Resources

1. Go to Dashboard (`/admin`)
2. Look at "Last Modified" dates in resource list
3. Or check statistics for "Last Edit Date"

### Task: Edit Specific Resource by ID

1. Navigate directly to: `/admin/edit/[id]`
   - Example: `/admin/edit/1` for resource #1
2. Edit and save

## Tips and Best Practices

1. **Auto-save is enabled**: Don't worry about losing changes, the system auto-saves
2. **Use diff view**: Always review changes before finalizing
3. **Admin mode persists**: No need to add `?admin=true` to every URL
4. **Keyboard shortcuts**: Use Ctrl+E for quick access to tools
5. **Search is powerful**: Use search in dashboard to quickly find resources

## Troubleshooting

### Admin mode not activating
- Clear browser localStorage
- Add `?admin=true` to URL again
- Hard refresh (Ctrl+Shift+R)

### Edit not saving
- Check browser console for errors
- Ensure `/data/content-edits.json` is writable
- Check network tab for API errors

### Content not loading
- Verify resource exists in `/data/resources.ts`
- Check that content file exists in `/public/` directory
- Look for errors in browser console

### Changes not appearing
- Clear browser cache
- Check that file was actually saved
- Verify edit status in dashboard

## Support

For technical issues or questions:
- Check architecture documentation: `/docs/architecture/content-review-integration.md`
- Review API route code: `/app/api/content/`
- Check component implementations: `/components/` and `/app/admin/`

---

**Guide Version**: 1.0
**Last Updated**: 2025-11-17
