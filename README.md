# Not Gonna Lie

Not Gonna Lie is a full-stack anonymous messaging app. Create a verified account, share your public profile link, and receive honest messages without revealing the sender's identity.

## Features

- Email-based account verification with a one-time code
- Credential authentication with NextAuth
- Public profiles at `/u/[username]` for sending anonymous messages
- Dashboard to read and delete messages
- Toggle to pause or allow incoming messages
- Username availability check during signup
- Responsive Japanese-inspired interface with Sonner notifications

## Tech stack

- Next.js 16 with the App Router
- React 19 and TypeScript
- MongoDB with Mongoose
- NextAuth credentials provider
- Nodemailer for verification emails
- Tailwind CSS and shadcn/ui components
- Zod and React Hook Form for validation

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Create your environment file

Copy `.env.example` to `.env` and fill in the required values.

```bash
Copy-Item .env.example .env
```

```env
MONGODB_URI="your-mongodb-connection-string"
NEXTAUTH_SECRET="a-long-random-secret"

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-gmail-address@gmail.com
SMTP_PASS=your-gmail-app-password
MAIL_FROM="Not Gonna Lie <your-gmail-address@gmail.com>"
```

For Gmail, enable two-step verification and create a Google **App Password**. Use that 16-character value for `SMTP_PASS`; do not use your normal Gmail password.

### 3. Start the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Starts the local development server. |
| `npm run build` | Creates a production build. |
| `npm run start` | Runs the production build. |
| `npm run lint` | Runs ESLint. |

## User flow

1. Sign up with a username, email address, and password.
2. Enter the verification code sent to your email.
3. Sign in using your email address or username.
4. Share `/u/your-username` to receive anonymous messages.
5. Use the dashboard to manage messages and control whether new messages are accepted.

## Main routes

| Route | Purpose |
| --- | --- |
| `/` | Landing page |
| `/sign-up` | Create an account |
| `/verify/[username]` | Verify an account with the emailed code |
| `/sign-in` | Sign in to an existing verified account |
| `/dashboard` | View messages and message settings |
| `/u/[username]` | Public anonymous-message form |

## API routes

| Endpoint | Method | Purpose |
| --- | --- | --- |
| `/api/sign-up` | `POST` | Creates or refreshes an unverified account and emails a code. |
| `/api/verify-code` | `POST` | Verifies a username and one-time code. |
| `/api/check-username-unique` | `GET` | Checks username availability. |
| `/api/send-message` | `POST` | Sends an anonymous message to a public profile. |
| `/api/get-messages` | `GET` | Gets the signed-in user's messages. |
| `/api/delete-message/[messageid]` | `DELETE` | Deletes one message. |
| `/api/accept-messages` | `GET`, `POST` | Reads or updates message acceptance status. |

## Security notes

- Never commit `.env` or real credentials.
- Rotate any secret that is accidentally exposed.
- Use a strong, unique `NEXTAUTH_SECRET` in every deployed environment.
- Configure production environment variables with your hosting provider instead of committing them to the repository.

## Project structure

```text
src/
├── app/            # Pages, layouts, and API route handlers
├── components/     # Shared UI components
├── context/        # Authentication provider
├── helpers/        # Verification-email delivery
├── lib/            # Database connection and utilities
├── model/          # Mongoose models
├── schemas/        # Zod validation schemas
└── types/          # Shared TypeScript types
```
