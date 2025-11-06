# Toast Notification System

A reusable, global toast notification system for displaying messages throughout your application.

## Setup

The `ToastProvider` and `ToastContainerComponent` are already set up in `App.tsx`. No additional setup is needed.

## Usage

### Basic Usage

```typescript
import { useToast } from '../../context/ToastContext';

export const MyComponent = () => {
  const { addToast } = useToast();

  const handleClick = () => {
    addToast({
      type: 'success',
      message: 'Operation completed successfully!',
      duration: 5000, // Optional: auto-dismiss after 5 seconds (0 = no auto-dismiss)
    });
  };

  return <button onClick={handleClick}>Show Toast</button>;
};
```

### With Action Handler

```typescript
const { addToast } = useToast();

addToast({
  type: 'info',
  message: '💬 New message received',
  duration: 5000,
  action: () => {
    console.log('Toast was clicked!');
    // Open a modal, navigate, etc.
  }
});
```

### Toast Types

- `'info'` - Blue toast (default)
- `'success'` - Green toast
- `'error'` - Red toast
- `'warning'` - Yellow/orange toast

### API Reference

#### `useToast()`

Returns an object with the following methods:

- **`addToast(toast: ToastOptions): string`**
  - Creates and displays a new toast notification
  - Returns the toast ID
  - Options:
    - `type`: 'info' | 'success' | 'error' | 'warning'
    - `message`: string - The notification text
    - `action?`: () => void - Optional click handler
    - `duration?`: number - Auto-dismiss time in ms (default: 5000, 0 = never dismiss)

- **`removeToast(id: string): void`**
  - Manually remove a toast by ID

- **`clearToasts(): void`**
  - Clear all toasts at once

### Examples

#### Success Message
```typescript
addToast({
  type: 'success',
  message: '✓ Profile updated successfully',
});
```

#### Error Message
```typescript
addToast({
  type: 'error',
  message: '✗ Failed to save changes',
  duration: 0, // Keep showing until manually dismissed
});
```

#### Interactive Toast (with action)
```typescript
addToast({
  type: 'info',
  message: '💬 New message from John',
  action: () => {
    setShowMessageModal(true);
  }
});
```

#### No Auto-Dismiss
```typescript
const toastId = addToast({
  type: 'warning',
  message: 'This is important! Click to acknowledge.',
  duration: 0, // Never auto-dismiss
  action: () => {
    removeToast(toastId);
  }
});
```

## Features

✅ **Global State** - Accessible from any component without prop drilling
✅ **Auto-dismiss** - Configurable auto-dismiss duration per toast
✅ **Click Actions** - Each toast can have an action handler
✅ **Type Safe** - Full TypeScript support
✅ **Animated** - Smooth slide-in animation
✅ **Multiple Types** - Info, success, error, and warning styles

