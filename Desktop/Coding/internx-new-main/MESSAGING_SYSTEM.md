# Messaging System Documentation

## Overview

The messaging system provides real-time communication between companies and interns, along with an announcements feature for companies to broadcast messages to multiple interns.

## Database Schema

### Tables

1. **conversations**
   - Links companies and interns for direct messaging
   - Contains conversation metadata and timestamps
   - Row-level security ensures users can only access their conversations

2. **messages**
   - Individual messages within conversations
   - Includes sender information and content
   - Supports both company and intern senders

3. **announcements**
   - One-way communication from companies to interns
   - Includes title, content, and recipient targeting
   - Supports read status tracking

## API Endpoints

### Conversations
- `GET /api/conversations` - List user's conversations
- `POST /api/conversations` - Create new conversation

### Messages
- `GET /api/conversations/[conversationId]/messages` - Get messages for a conversation
- `POST /api/conversations/[conversationId]/messages` - Send a new message

### Announcements
- `GET /api/announcements` - List user's announcements
- `POST /api/announcements` - Create new announcement

## Frontend Components

### Core Components

1. **MessagingPortal** (`/src/components/MessagingPortal.tsx`)
   - Main messaging interface with conversation list and chat area
   - Supports both messages and announcements tabs
   - Real-time message display with proper styling

2. **NewConversationModal** (`/src/components/NewConversationModal.tsx`)
   - Modal for starting new conversations
   - User search and selection interface
   - Supports both company and intern user types

3. **CreateAnnouncementModal** (`/src/components/CreateAnnouncementModal.tsx`)
   - Modal for companies to create announcements
   - Multi-select intern recipients
   - Form validation and submission

### Pages

1. **General Messaging** (`/app/messaging/page.tsx`)
   - Universal messaging page for all users
   - Automatically detects user type (company/intern)

2. **Company Messaging** (`/app/company/messaging/page.tsx`)
   - Company-specific messaging interface
   - Includes announcement creation functionality

## Features

### Messaging
- Real-time conversation between companies and interns
- Message history with timestamps
- User avatars and names
- Responsive design for mobile and desktop

### Announcements
- Companies can send announcements to multiple interns
- Announcement history with read status
- Rich text support for announcements
- Recipient targeting and selection

### Security
- Row-level security (RLS) policies
- User authentication required
- Conversation access validation
- Proper error handling

## Navigation Integration

The messaging system is integrated into the main navigation:

- **UserNavbar**: Added "Messages" link for signed-in users
- **CompanyNavbar**: Added "Messages" link for company users

## Usage

### For Companies
1. Navigate to `/company/messaging`
2. Use "Message Intern" to start direct conversations
3. Use "Send Announcement" to broadcast messages to multiple interns
4. View all conversations and announcements in the portal

### For Interns
1. Navigate to `/messaging`
2. View conversations with companies
3. Read announcements from companies
4. Start new conversations with companies

## Database Migration

The messaging system requires the following migration to be run in Supabase:

```sql
-- File: supabase/migrations/create_messaging_system_safe.sql
-- This migration creates all necessary tables, policies, and indexes
```

## Future Enhancements

1. **Real-time Updates**: Implement WebSocket connections for live message updates
2. **File Attachments**: Support for file uploads in messages
3. **Message Status**: Read receipts and delivery status
4. **Push Notifications**: Browser and mobile notifications
5. **Message Search**: Search functionality within conversations
6. **Message Reactions**: Emoji reactions to messages
7. **Group Conversations**: Support for multiple participants
8. **Message Threading**: Reply to specific messages

## Technical Notes

- Uses Supabase for authentication and database
- Implements proper TypeScript interfaces
- Responsive design with Tailwind CSS
- Error handling and loading states
- Optimistic UI updates for better UX 

## Overview

The messaging system provides real-time communication between companies and interns, along with an announcements feature for companies to broadcast messages to multiple interns.

## Database Schema

### Tables

1. **conversations**
   - Links companies and interns for direct messaging
   - Contains conversation metadata and timestamps
   - Row-level security ensures users can only access their conversations

2. **messages**
   - Individual messages within conversations
   - Includes sender information and content
   - Supports both company and intern senders

3. **announcements**
   - One-way communication from companies to interns
   - Includes title, content, and recipient targeting
   - Supports read status tracking

## API Endpoints

### Conversations
- `GET /api/conversations` - List user's conversations
- `POST /api/conversations` - Create new conversation

### Messages
- `GET /api/conversations/[conversationId]/messages` - Get messages for a conversation
- `POST /api/conversations/[conversationId]/messages` - Send a new message

### Announcements
- `GET /api/announcements` - List user's announcements
- `POST /api/announcements` - Create new announcement

## Frontend Components

### Core Components

1. **MessagingPortal** (`/src/components/MessagingPortal.tsx`)
   - Main messaging interface with conversation list and chat area
   - Supports both messages and announcements tabs
   - Real-time message display with proper styling

2. **NewConversationModal** (`/src/components/NewConversationModal.tsx`)
   - Modal for starting new conversations
   - User search and selection interface
   - Supports both company and intern user types

3. **CreateAnnouncementModal** (`/src/components/CreateAnnouncementModal.tsx`)
   - Modal for companies to create announcements
   - Multi-select intern recipients
   - Form validation and submission

### Pages

1. **General Messaging** (`/app/messaging/page.tsx`)
   - Universal messaging page for all users
   - Automatically detects user type (company/intern)

2. **Company Messaging** (`/app/company/messaging/page.tsx`)
   - Company-specific messaging interface
   - Includes announcement creation functionality

## Features

### Messaging
- Real-time conversation between companies and interns
- Message history with timestamps
- User avatars and names
- Responsive design for mobile and desktop

### Announcements
- Companies can send announcements to multiple interns
- Announcement history with read status
- Rich text support for announcements
- Recipient targeting and selection

### Security
- Row-level security (RLS) policies
- User authentication required
- Conversation access validation
- Proper error handling

## Navigation Integration

The messaging system is integrated into the main navigation:

- **UserNavbar**: Added "Messages" link for signed-in users
- **CompanyNavbar**: Added "Messages" link for company users

## Usage

### For Companies
1. Navigate to `/company/messaging`
2. Use "Message Intern" to start direct conversations
3. Use "Send Announcement" to broadcast messages to multiple interns
4. View all conversations and announcements in the portal

### For Interns
1. Navigate to `/messaging`
2. View conversations with companies
3. Read announcements from companies
4. Start new conversations with companies

## Database Migration

The messaging system requires the following migration to be run in Supabase:

```sql
-- File: supabase/migrations/create_messaging_system_safe.sql
-- This migration creates all necessary tables, policies, and indexes
```

## Future Enhancements

1. **Real-time Updates**: Implement WebSocket connections for live message updates
2. **File Attachments**: Support for file uploads in messages
3. **Message Status**: Read receipts and delivery status
4. **Push Notifications**: Browser and mobile notifications
5. **Message Search**: Search functionality within conversations
6. **Message Reactions**: Emoji reactions to messages
7. **Group Conversations**: Support for multiple participants
8. **Message Threading**: Reply to specific messages

## Technical Notes

- Uses Supabase for authentication and database
- Implements proper TypeScript interfaces
- Responsive design with Tailwind CSS
- Error handling and loading states
- Optimistic UI updates for better UX 

## Overview

The messaging system provides real-time communication between companies and interns, along with an announcements feature for companies to broadcast messages to multiple interns.

## Database Schema

### Tables

1. **conversations**
   - Links companies and interns for direct messaging
   - Contains conversation metadata and timestamps
   - Row-level security ensures users can only access their conversations

2. **messages**
   - Individual messages within conversations
   - Includes sender information and content
   - Supports both company and intern senders

3. **announcements**
   - One-way communication from companies to interns
   - Includes title, content, and recipient targeting
   - Supports read status tracking

## API Endpoints

### Conversations
- `GET /api/conversations` - List user's conversations
- `POST /api/conversations` - Create new conversation

### Messages
- `GET /api/conversations/[conversationId]/messages` - Get messages for a conversation
- `POST /api/conversations/[conversationId]/messages` - Send a new message

### Announcements
- `GET /api/announcements` - List user's announcements
- `POST /api/announcements` - Create new announcement

## Frontend Components

### Core Components

1. **MessagingPortal** (`/src/components/MessagingPortal.tsx`)
   - Main messaging interface with conversation list and chat area
   - Supports both messages and announcements tabs
   - Real-time message display with proper styling

2. **NewConversationModal** (`/src/components/NewConversationModal.tsx`)
   - Modal for starting new conversations
   - User search and selection interface
   - Supports both company and intern user types

3. **CreateAnnouncementModal** (`/src/components/CreateAnnouncementModal.tsx`)
   - Modal for companies to create announcements
   - Multi-select intern recipients
   - Form validation and submission

### Pages

1. **General Messaging** (`/app/messaging/page.tsx`)
   - Universal messaging page for all users
   - Automatically detects user type (company/intern)

2. **Company Messaging** (`/app/company/messaging/page.tsx`)
   - Company-specific messaging interface
   - Includes announcement creation functionality

## Features

### Messaging
- Real-time conversation between companies and interns
- Message history with timestamps
- User avatars and names
- Responsive design for mobile and desktop

### Announcements
- Companies can send announcements to multiple interns
- Announcement history with read status
- Rich text support for announcements
- Recipient targeting and selection

### Security
- Row-level security (RLS) policies
- User authentication required
- Conversation access validation
- Proper error handling

## Navigation Integration

The messaging system is integrated into the main navigation:

- **UserNavbar**: Added "Messages" link for signed-in users
- **CompanyNavbar**: Added "Messages" link for company users

## Usage

### For Companies
1. Navigate to `/company/messaging`
2. Use "Message Intern" to start direct conversations
3. Use "Send Announcement" to broadcast messages to multiple interns
4. View all conversations and announcements in the portal

### For Interns
1. Navigate to `/messaging`
2. View conversations with companies
3. Read announcements from companies
4. Start new conversations with companies

## Database Migration

The messaging system requires the following migration to be run in Supabase:

```sql
-- File: supabase/migrations/create_messaging_system_safe.sql
-- This migration creates all necessary tables, policies, and indexes
```

## Future Enhancements

1. **Real-time Updates**: Implement WebSocket connections for live message updates
2. **File Attachments**: Support for file uploads in messages
3. **Message Status**: Read receipts and delivery status
4. **Push Notifications**: Browser and mobile notifications
5. **Message Search**: Search functionality within conversations
6. **Message Reactions**: Emoji reactions to messages
7. **Group Conversations**: Support for multiple participants
8. **Message Threading**: Reply to specific messages

## Technical Notes

- Uses Supabase for authentication and database
- Implements proper TypeScript interfaces
- Responsive design with Tailwind CSS
- Error handling and loading states
- Optimistic UI updates for better UX 

## Overview

The messaging system provides real-time communication between companies and interns, along with an announcements feature for companies to broadcast messages to multiple interns.

## Database Schema

### Tables

1. **conversations**
   - Links companies and interns for direct messaging
   - Contains conversation metadata and timestamps
   - Row-level security ensures users can only access their conversations

2. **messages**
   - Individual messages within conversations
   - Includes sender information and content
   - Supports both company and intern senders

3. **announcements**
   - One-way communication from companies to interns
   - Includes title, content, and recipient targeting
   - Supports read status tracking

## API Endpoints

### Conversations
- `GET /api/conversations` - List user's conversations
- `POST /api/conversations` - Create new conversation

### Messages
- `GET /api/conversations/[conversationId]/messages` - Get messages for a conversation
- `POST /api/conversations/[conversationId]/messages` - Send a new message

### Announcements
- `GET /api/announcements` - List user's announcements
- `POST /api/announcements` - Create new announcement

## Frontend Components

### Core Components

1. **MessagingPortal** (`/src/components/MessagingPortal.tsx`)
   - Main messaging interface with conversation list and chat area
   - Supports both messages and announcements tabs
   - Real-time message display with proper styling

2. **NewConversationModal** (`/src/components/NewConversationModal.tsx`)
   - Modal for starting new conversations
   - User search and selection interface
   - Supports both company and intern user types

3. **CreateAnnouncementModal** (`/src/components/CreateAnnouncementModal.tsx`)
   - Modal for companies to create announcements
   - Multi-select intern recipients
   - Form validation and submission

### Pages

1. **General Messaging** (`/app/messaging/page.tsx`)
   - Universal messaging page for all users
   - Automatically detects user type (company/intern)

2. **Company Messaging** (`/app/company/messaging/page.tsx`)
   - Company-specific messaging interface
   - Includes announcement creation functionality

## Features

### Messaging
- Real-time conversation between companies and interns
- Message history with timestamps
- User avatars and names
- Responsive design for mobile and desktop

### Announcements
- Companies can send announcements to multiple interns
- Announcement history with read status
- Rich text support for announcements
- Recipient targeting and selection

### Security
- Row-level security (RLS) policies
- User authentication required
- Conversation access validation
- Proper error handling

## Navigation Integration

The messaging system is integrated into the main navigation:

- **UserNavbar**: Added "Messages" link for signed-in users
- **CompanyNavbar**: Added "Messages" link for company users

## Usage

### For Companies
1. Navigate to `/company/messaging`
2. Use "Message Intern" to start direct conversations
3. Use "Send Announcement" to broadcast messages to multiple interns
4. View all conversations and announcements in the portal

### For Interns
1. Navigate to `/messaging`
2. View conversations with companies
3. Read announcements from companies
4. Start new conversations with companies

## Database Migration

The messaging system requires the following migration to be run in Supabase:

```sql
-- File: supabase/migrations/create_messaging_system_safe.sql
-- This migration creates all necessary tables, policies, and indexes
```

## Future Enhancements

1. **Real-time Updates**: Implement WebSocket connections for live message updates
2. **File Attachments**: Support for file uploads in messages
3. **Message Status**: Read receipts and delivery status
4. **Push Notifications**: Browser and mobile notifications
5. **Message Search**: Search functionality within conversations
6. **Message Reactions**: Emoji reactions to messages
7. **Group Conversations**: Support for multiple participants
8. **Message Threading**: Reply to specific messages

## Technical Notes

- Uses Supabase for authentication and database
- Implements proper TypeScript interfaces
- Responsive design with Tailwind CSS
- Error handling and loading states
- Optimistic UI updates for better UX 