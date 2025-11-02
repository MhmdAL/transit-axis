# Moveo-CC (Command & Control)

Operational tracking and monitoring application for real-time fleet management.

## Features

- Real-time tracking view with interactive map (Leaflet)
- Vehicle emulator for testing (simulates driver app)
- Navigation sidebar with collapsible menu
- Modern, dark-themed UI with teal accent colors
- Built with React, TypeScript, and Vite

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Leaflet** - Interactive maps
- **React Leaflet** - React bindings for Leaflet
- **Styled Components** - CSS-in-JS styling

## Project Structure

```
moveo-cc/
├── src/
│   ├── pages/
│   │   └── Tracking/
│   │       └── RealTimeTracking.tsx
│   ├── styles/
│   │   ├── theme.ts
│   │   └── GlobalStyles.ts
│   ├── App.tsx
│   └── main.tsx
├── public/
└── package.json
```
