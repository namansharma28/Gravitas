# Gravitas – Community Event Management Platform

<p align="center">
  <img src="public/logo.svg" alt="Gravitas Logo" width="120"/>
</p>

<p align="center">
  <b>Connect with communities, discover events, and engage with content.<br>Join Gravitas to find and create meaningful community events.</b>
</p>

---

## 🚀 Overview

**Gravitas** is a modern, full-featured platform for discovering, creating, and managing community events. Whether you're an event organizer, a community leader, or an attendee, Gravitas empowers you to connect, collaborate, and engage with your favorite communities and events.

---

## ✨ Features

- **Community Discovery & Management**: Explore trending communities, join or follow, and manage your own.
- **Event Creation & Registration**: Create, edit, and manage events. Register, RSVP, and check in with QR codes.
- **Personalized Feed**: Stay updated with a tailored feed of events and community updates.
- **Profile & Social Features**: Manage your profile, track your activity, and connect with others.
- **Notifications**: Real-time and scheduled notifications for events, updates, and reminders.
- **Calendar View**: Visualize upcoming events in a beautiful calendar interface.
- **Admin Dashboard**: Approve communities, view stats, and manage the platform.
- **PWA Support**: Install Gravitas as a Progressive Web App for a native-like experience.
- **Secure Authentication**: Sign in with Google or email/password, with email verification and OTP support.
- **Media & Document Sharing**: Attach images, videos, and documents to events and updates.
- **Accessibility & Dark Mode**: Fully responsive, accessible, and supports light/dark themes.

---

## 🛠️ Technologies Used

- **Frontend**: [Next.js](https://nextjs.org/), [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/), [Radix UI](https://www.radix-ui.com/), [Lucide Icons](https://lucide.dev/)
- **State & Forms**: [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/), Google OAuth, Credentials
- **Database**: [MongoDB](https://www.mongodb.com/), [Mongoose](https://mongoosejs.com/)
- **Cloud & Media**: [Cloudinary](https://cloudinary.com/), [next-cloudinary](https://www.npmjs.com/package/next-cloudinary)
- **PWA**: [next-pwa](https://github.com/shadowwalker/next-pwa)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Utilities**: [date-fns](https://date-fns.org/), [clsx](https://www.npmjs.com/package/clsx), [cmdk](https://cmdk.paco.me/)
- **Other**: [QRCode](https://www.npmjs.com/package/qrcode), [xlsx](https://www.npmjs.com/package/xlsx), [Nodemailer](https://nodemailer.com/)

---

## 📦 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB instance (local or cloud)

### Installation

```bash
# Clone the repository
$ git clone https://github.com/namansharma28/gravitas
$ cd gravitas

# Install dependencies
$ npm install

# Copy and configure environment variables
$ cp .env.example .env
# Edit .env with your MongoDB URI, Google OAuth, SMTP, etc.

# Run the development server
$ npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the app.

---

## 🧩 Project Structure

- `app/` – Next.js app directory (pages, layouts, API routes)
- `components/` – Reusable UI and feature components
- `lib/` – Utility libraries (auth, db, email, etc.)
- `public/` – Static assets (icons, images, manifest)
- `styles/` – Global and custom styles
- `types/` – TypeScript type definitions

---

## 🤝 Contributing

Contributions are welcome! Please open issues and pull requests for new features, bug fixes, or improvements.

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

<p align="center">
  <b>Gravitas – Empowering Communities, One Event at a Time.</b>
</p>
