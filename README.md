# Second Me v2

> Your digital twin, evolved. Seamlessly integrating chat, personality, and social connection.

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-16.1-black)

## Description

**Second Me v2** is a cutting-edge web application designed to create a digital extension of yourself. It leverages advanced AI to model personality traits, facilitate automated social interactions, and discover compatible connections through an intelligent matching system.

Built for users who want to explore digital identity and social automation, Second Me v2 solves the problem of maintaining meaningful digital presence and finding relevant connections in an increasingly noisy online world.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Screenshots](#screenshots)
- [API Reference](#api-reference)
- [Tests](#tests)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Features

- **Digital Twin Identity**: Create and manage a digital avatar with customizable "Shades" (personality traits).
- **Intelligent Chat**: Real-time chat interface powered by your digital twin's personality.
- **Compatibility Matching**: Automated matchmaking system that calculates compatibility scores between users.
- **Active Memory**: persistent memory system allows your twin to remember context and user details.
- **Voice Integration**: Text-to-speech capabilities for immersive interaction.
- **OAuth Integration**: Secure authentication with the SecondMe platform.

## Tech Stack

- **Frontend**: [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/)
- **Backend**: Next.js API Routes (Serverless)
- **Database**: [SQLite](https://www.sqlite.org/) (dev), [LibSQL](https://turso.tech/) (prod ready)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)

## Architecture Overview

```mermaid
flowchart LR
  User[User] --> WebApp[Next.js Web App]
  WebApp --> API[Next.js API Routes]
  API --> DB[(SQLite / LibSQL)]
  API --> Auth[SecondMe OAuth]
  API --> AI[AI Services (Gemini/Runware)]
```

The **Next.js Web App** serves as the unified frontend and backend. Users interact with the React-based UI, which communicates with internal **API Routes**. These routes handle business logic, authenticate users via **SecondMe OAuth**, and persist data (users, chats, matches) to the **SQLite/LibSQL Database** using Prisma. External **AI Services** are called for generating personality-driven responses and compatibility analysis.

## Installation

Follow these steps to set up the project locally:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/MasteraSnackin/second-mev2.git
    cd second-mev2
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up the database:**
    ```bash
    npx prisma generate
    npx prisma db push
    ```

## Usage

### Development Server

To start the development server with Turbopack:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Production Build

To build and start for production:

```bash
npm run build
npm start
```

## Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="file:./dev.db"

# Authentication (Placeholders)
SECONDME_CLIENT_ID="your_client_id"
SECONDME_CLIENT_SECRET="your_client_secret"

# AI Services (Placeholders)
GEMINI_API_KEY="your_gemini_key"
```

## Screenshots

![Dashboard Screenshot](https://via.placeholder.com/800x450.png?text=Dashboard+Screenshot)
*The main dashboard showing user stats and active chat sessions.*

[View Live Demo](https://your-demo-url.com)

## API Reference

The application exposes several internal API endpoints:

-   `GET /api/user/info`: Retrieve current user profile.
-   `POST /api/chat`: Send a message to a chat session.
-   `GET /api/user/shades`: Get user personality traits.

Example Request:
```bash
curl http://localhost:3000/api/user/info
```

## Tests

Currently, the project supports linting. Full test suite setup is in progress.

```bash
# Run linting
npm run lint
```

## Roadmap

- [ ] Add unit tests with Jest/Vitest.
- [ ] Implement end-to-end testing with Playwright.
- [ ] Enhance "Active Memory" with vector database integration.
- [ ] Mobile application (React Native).

## Contributing

We welcome contributions! Please follow these steps:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/amazing-feature`).
3.  Commit your changes (`git commit -m 'Add some amazing feature'`).
4.  Push to the branch (`git push origin feature/amazing-feature`).
5.  Open a Pull Request.

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Contact

**Maintainer**: MasteraSnackin  
**GitHub**: [https://github.com/MasteraSnackin](https://github.com/MasteraSnackin)  
**Project Link**: [https://github.com/MasteraSnackin/second-mev2](https://github.com/MasteraSnackin/second-mev2)
