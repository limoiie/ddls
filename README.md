# Conference Deadlines Tracker

A web application for tracking research conference deadlines.

## Features

- Conference database with CCF rankings
- Set notification times for deadlines
- Table and card views with filtering

## Quick Start

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/limoiie/ddls.git
   cd ddls
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Run the development server

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Development Commands

```bash
npm run dev    # Start development server
npm run build  # Build for production
npm run start  # Start production server
npm run lint   # Run linting
```

## Conference Data Management

The application uses conference data from two sources:

### Data Sources

1. [`ccfddl/ccf-deadlines`](https://github.com/ccfddl/ccf-deadlines) repository (submodule)
2. Local conference configurations in `data/conferences/`

### Updating Conference Data

#### For Maintainers

**Preferred Method:**

1. Submit pull requests to [`ccfddl/ccf-deadlines`](https://github.com/ccfddl/ccf-deadlines)
2. Data syncs automatically via the update script (replaces GitHub Actions)
3. Manual sync: `npm run update-conferences:once`

#### Automated Updates

The project includes a Node.js script for automated conference data updates:

**Configuration:**
- Update interval: Configurable (default: 24 hours)
- Retry logic: 3 attempts with 30-second delays
- Logging: Automatic logging to `update.log`

**Available Commands:**
```bash
# Start periodic updates (runs in background)
npm run update-conferences:start

# Stop periodic updates
npm run update-conferences:stop

# Run one-time update
npm run update-conferences:once

# Show current status
npm run update-conferences status

# Configure update interval (hours)
npm run update-conferences set-interval 12

# Configure retry attempts
npm run update-conferences set-retries 5

# View/modify configuration
npm run update-conferences config
```

**Configuration File:**
The script uses `update-config.json` for settings:
```json
{
  "intervalHours": 24,
  "maxRetries": 3,
  "submodulePath": "data/ccf-deadlines",
  "commitMessage": "chore: update ccf-deadlines submodule",
  "logFile": "update.log"
}
```

#### Local Conference Management

For lab-specific conferences, manage data locally:

**Directory Structure:**

```
data/
├── ccf-deadlines/          # Submodule (upstream data)
└── conferences/            # Local custom data
    ├── types.yml          # Conference categories
    ├── AI/                # AI conferences
    ├── CG/                # Computer Graphics
    ├── DS/                # Distributed Systems
    └── ...                # Other categories
```

**Adding a New Conference:**

Create a `.yml` file in the appropriate category directory:

```yaml
- title: ACCV
  description: Asian Conference on Computer Vision
  sub: AI
  rank:
    ccf: C
    core: B
    thcpl: N
  dblp: accv
  confs:
    - year: 2024
      id: accv24
      link: https://accv2024.org/
      timeline:
        - deadline: "2024-07-02 23:59:59"
      timezone: UTC-12
      date: December 8-12, 2024
      place: Hanoi, Vietnam
```

**Conference Categories:**

- AI: Artificial Intelligence
- CG: Computer Graphics
- CT: Computational Theory
- DB: Database Systems
- DS: Distributed Systems
- HI: Human-Computer Interaction
- MX: Multidisciplinary
- NW: Networking
- SC: Security
- SE: Software Engineering

## Notification System

Set notification times for conference timelines.

### Setting Notifications

1. Find the conference you want to set a notification for
2. Click on the notification placeholder in the conference card or table
3. Choose your desired notification time using the datetime picker
4. Click "Save" to save your notification setting

### Managing Notifications

- Edit: Click on existing notification times to modify them
- Delete: Set notification time to "None" or clear the field to remove notifications
- View: All set notifications are displayed in the conference cards

## Acknowledgments

- CCF Deadlines: Thanks to the [ccfddl/ccf-deadlines](https://github.com/ccfddl/ccf-deadlines) project for the conference database
- Next.js Team: For the React framework
- Radix UI: For the UI component primitives
