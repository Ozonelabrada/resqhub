# SHERRA - Lost and Found Platform

SHERRA is a React-based platform focused on helping communities reunite lost items with their owners.

## Features

- **Report Lost/Found Items**: Easily create reports with descriptions, categories, and images.
- **Community Comments**: Share tips and information on reports to help others.
- **Geolocation**: Automatically detect location for more accurate reporting.
- **Personal Hub**: Manage your reports and track their status.
- **Manual Authentication**: Secure email/password login and signup with JWT validation.
- **Production Ready**: Optimized with lazy loading, security headers, and global error handling.

## Tech Stack

- **Frontend**: React, TypeScript, Vite
- **UI Components**: PrimeReact, PrimeFlex, PrimeIcons
- **API Client**: Axios
- **State Management**: React Context API
- **Routing**: React Router DOM

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Ozonelabrada/resqhub.git
   cd resqhub
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:

   ```env
   VITE_APP_API_BASE_URL=https://resqhub-be.onrender.com
   VITE_APP_API_TIMEOUT=10000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Deployment

The app is configured for deployment on Vercel. Simply connect your repository to Vercel and it will automatically deploy using the `vercel.json` configuration.

## Security

- **CSP**: Content Security Policy implemented in `index.html`.
- **Headers**: Security headers (XSS, Frame Options, etc.) configured in `vercel.json`.
- **Sanitization**: Input sanitization implemented for all user-generated content.
- **JWT**: Secure token management with expiration checks.

## License

This project is licensed under the MIT License.
