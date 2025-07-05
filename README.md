# 🎉 Eventify - Community Event Management Platform

<div align="center">
  <img src="https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&dpr=2" alt="Eventify Banner" width="800" height="400" style="border-radius: 10px; object-fit: cover;">
  
  <h3>Connect • Organize • Celebrate</h3>
  
  [![Next.js](https://img.shields.io/badge/Next.js-13.5-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-6.0-green?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
  [![NextAuth.js](https://img.shields.io/badge/NextAuth.js-4.24-purple?style=for-the-badge&logo=next.js)](https://next-auth.js.org/)
</div>

---

## ✨ Overview

**Eventify** is a modern, full-stack community event management platform that empowers communities to create, discover, and participate in meaningful events. Built with cutting-edge technologies, it provides a seamless experience for event organizers and attendees alike.

### 🎯 Mission
To bridge the gap between communities and their members by providing an intuitive platform for event discovery, organization, and engagement.

---

## 🚀 Key Features

### 🏘️ **Community Management**
- **Create & Customize Communities** - Build your community with custom branding, descriptions, and settings
- **Role-Based Access Control** - Admin, member, and follower roles with granular permissions
- **Community Discovery** - Explore trending and verified communities
- **Follow System** - Stay updated with communities you care about

### 📅 **Event Management**
- **Rich Event Creation** - Create events with images, descriptions, multi-day support
- **Smart Calendar Integration** - Visual calendar with event indicators and filtering
- **Registration System** - Direct registration or custom form-based registration
- **QR Code Check-ins** - Generate and scan QR codes for seamless event check-ins
- **Capacity Management** - Set limits and track attendance

### 📝 **Advanced Forms & Registration**
- **Dynamic Form Builder** - Create custom registration forms with multiple field types
- **File Upload Support** - Accept documents, images, and other files
- **Participant Management** - Shortlist participants and manage registrations
- **Excel Export** - Export participant data for analysis
- **Email Tickets** - Send personalized tickets with QR codes

### 📱 **User Experience**
- **Responsive Design** - Optimized for all devices and screen sizes
- **Dark/Light Mode** - Automatic theme switching with system preference support
- **Real-time Updates** - Live feed of community activities and events
- **Smart Notifications** - Customizable email notifications and reminders
- **Progressive Web App** - App-like experience on mobile devices

### 🔐 **Security & Authentication**
- **Multi-Provider Auth** - Email/password and Google OAuth integration
- **Email Verification** - OTP-based email verification system
- **Secure File Uploads** - Cloudinary integration for secure media storage
- **Data Privacy** - GDPR-compliant data handling and user controls

---

## 🛠️ Technology Stack

### **Frontend**
- **Framework**: Next.js 13.5 with App Router
- **Language**: TypeScript 5.2
- **Styling**: Tailwind CSS 3.3 + shadcn/ui components
- **Animations**: Framer Motion for smooth interactions
- **Icons**: Lucide React for consistent iconography

### **Backend**
- **Runtime**: Node.js with Next.js API Routes
- **Database**: MongoDB with native driver
- **Authentication**: NextAuth.js with multiple providers
- **File Storage**: Cloudinary for media management
- **Email Service**: Nodemailer with SMTP support

### **Development Tools**
- **Package Manager**: npm
- **Linting**: ESLint with Next.js configuration
- **Type Checking**: TypeScript strict mode
- **Code Quality**: Prettier for formatting

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB database
- Cloudinary account (for file uploads)
- SMTP email service (for notifications)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/eventify.git
   cd eventify
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/eventify
   
   # NextAuth
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key
   
   # Google OAuth
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   
   # Cloudinary
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   
   # Email (SMTP)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
eventify/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── communities/          # Community management
│   │   ├── events/               # Event management
│   │   └── calendar/             # Calendar functionality
│   ├── auth/                     # Authentication pages
│   ├── communities/              # Community pages
│   ├── events/                   # Event pages
│   └── calendar/                 # Calendar page
├── components/                   # Reusable UI components
│   ├── ui/                       # shadcn/ui components
│   ├── events/                   # Event-specific components
│   ├── communities/              # Community components
│   └── layout/                   # Layout components
├── lib/                          # Utility libraries
│   ├── auth.ts                   # NextAuth configuration
│   ├── mongodb.ts                # Database connection
│   ├── email.ts                  # Email utilities
│   └── utils.ts                  # General utilities
└── types/                        # TypeScript type definitions
```

---

## 🎨 Design Philosophy

### **Apple-Level Aesthetics**
- **Minimalist Design** - Clean, uncluttered interfaces that focus on content
- **Micro-interactions** - Subtle animations that provide feedback and delight
- **Consistent Typography** - Carefully chosen fonts and spacing for optimal readability
- **Color Psychology** - Thoughtful color choices that enhance user experience

### **Accessibility First**
- **WCAG 2.1 Compliance** - Ensuring the platform is accessible to all users
- **Keyboard Navigation** - Full keyboard support for all interactions
- **Screen Reader Support** - Semantic HTML and ARIA labels
- **High Contrast** - Sufficient color contrast ratios in all themes

---

## 🔧 Configuration

### **Database Setup**
The application uses MongoDB with the following collections:
- `users` - User accounts and profiles
- `communities` - Community information and settings
- `events` - Event details and metadata
- `forms` - Custom registration forms
- `formResponses` - Form submission data
- `follows` - Community follow relationships
- `eventRegistrations` - Event registration records

### **Email Configuration**
Configure SMTP settings for:
- Email verification during registration
- Event reminders and notifications
- Ticket delivery with QR codes
- Community update notifications

### **File Upload Setup**
Cloudinary integration provides:
- Secure image and document uploads
- Automatic image optimization
- CDN delivery for fast loading
- Multiple format support

---

## 🚀 Deployment

### **Vercel (Recommended)**
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy with automatic CI/CD

### **Docker**
```bash
# Build the Docker image
docker build -t eventify .

# Run the container
docker run -p 3000:3000 eventify
```

### **Manual Deployment**
```bash
# Build the application
npm run build

# Start the production server
npm start
```

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### **Getting Started**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

### **Development Guidelines**
- Follow TypeScript best practices
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure responsive design compatibility

### **Code Style**
- Use ESLint and Prettier configurations
- Follow component naming conventions
- Maintain consistent file organization
- Write self-documenting code with clear variable names

---

## 📊 Performance

### **Optimization Features**
- **Image Optimization** - Next.js automatic image optimization
- **Code Splitting** - Automatic route-based code splitting
- **Caching Strategy** - Intelligent caching for API responses
- **Bundle Analysis** - Regular bundle size monitoring

### **Performance Metrics**
- **Lighthouse Score**: 95+ across all categories
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s
- **Cumulative Layout Shift**: < 0.1

---

## 🔒 Security

### **Security Measures**
- **Input Validation** - Comprehensive server-side validation
- **SQL Injection Prevention** - Parameterized queries and sanitization
- **XSS Protection** - Content Security Policy and input sanitization
- **CSRF Protection** - Built-in NextAuth.js CSRF protection
- **Rate Limiting** - API rate limiting to prevent abuse

### **Data Protection**
- **Encryption** - All sensitive data encrypted at rest and in transit
- **Privacy Controls** - User data export and deletion capabilities
- **Audit Logging** - Comprehensive logging for security monitoring
- **Regular Updates** - Automated dependency updates for security patches

---

## 📈 Analytics & Monitoring

### **Built-in Analytics**
- User engagement metrics
- Event attendance tracking
- Community growth analytics
- Performance monitoring

### **Integration Ready**
- Google Analytics 4
- Mixpanel for advanced analytics
- Sentry for error tracking
- LogRocket for user session replay

---

## 📱 Mobile App

### **Progressive Web App**
- Offline functionality
- Push notifications
- App-like navigation
- Home screen installation
