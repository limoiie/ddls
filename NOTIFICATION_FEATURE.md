# Notification Time Feature

This feature adds the ability to set custom notification times for conference editions, stored in a local SQLite database.

## Features

- **Database Storage**: Notification times are stored in SQLite database (`data/notifications.db`)
- **API Integration**: RESTful API endpoints for managing notification times
- **UI Integration**: Editable notification time inputs in the ConferenceEdition component
- **Automatic Inflation**: Notification times are automatically loaded and displayed when fetching conferences

## Database Schema

The `notification_times` table stores:
- `conf_edition_id` (TEXT, PRIMARY KEY): The conference edition ID
- `notification_time` (TEXT): The notification time in ISO format
- `created_at` (DATETIME): When the record was created
- `updated_at` (DATETIME): When the record was last updated

## API Endpoints

### POST /api/notifications
Set or update a notification time for a conference edition.

**Request Body:**
```json
{
  "confEditionId": "string",
  "notification": "string" // ISO datetime string, or null to delete
}
```

### DELETE /api/notifications?confEditionId={id}
Delete a notification time for a conference edition.

## Usage

1. **Setting Notification Time**: Click "Set" or "Edit" button next to "Notification Time" in any conference edition
2. **Editing**: Use the datetime-local input to set the desired notification time
3. **Saving**: Click "Save" to persist the notification time to the database
4. **Canceling**: Click "Cancel" to discard changes

## Technical Implementation

- **Database**: SQLite with better-sqlite3
- **API**: Next.js API routes
- **UI**: React state management with inline editing
- **Data Flow**: Database → API → Component → UI

## Files Modified

- `app/types/api.ts`: Added `notification_time` field to Timeline interface
- `app/lib/database.ts`: Database utilities and connection management
- `app/api/items/route.ts`: Modified to inflate notification times into timelines
- `app/api/notifications/route.ts`: New API endpoint for notification time CRUD operations
- `app/components/ConferenceEdition.tsx`: Added editable notification time UI
