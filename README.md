# 🎯 Gravitas – Community Event Management Platform

<p align="center">
  <img src="public/logo.svg" alt="Gravitas Logo" width="120"/>
</p>

<p align="center">
  <b>🌟 Connect • Discover • Engage</b><br>
  <i>The ultimate platform for community-driven events and meaningful connections</i>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" alt="Next.js"/>
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind"/>
</p>

---

## 🚀 Overview

**Gravitas** is a cutting-edge, full-stack platform that revolutionizes how communities organize, discover, and participate in events. Built with modern web technologies, it provides a seamless experience for event organizers, community leaders, and attendees alike.

---

## ✨ Core Features

### 🏘️ **Community Management**
- **Discover Communities**: Explore trending and popular communities with advanced filtering
- **Community Profiles**: Rich community pages with banners, descriptions, and member counts
- **Join & Follow**: Flexible membership options with different engagement levels
- **Community Creation**: Easy-to-use community setup with approval workflows
- **Admin Controls**: Comprehensive community management tools for admins

### 🎪 **Event Management**
- **Event Creation**: Intuitive event builder with rich media support
- **Event Discovery**: Smart search and filtering to find relevant events
- **RSVP System**: Streamlined registration with capacity management
- **QR Code Check-ins**: Modern, contactless event check-in system
- **Event Analytics**: Detailed insights for organizers

### 📋 **Advanced Form Builder**
- **Dynamic Forms**: Create custom registration forms with multiple field types
- **Field Types**: Text, email, number, select dropdowns, checkboxes, file uploads
- **Single Choice Checkboxes**: Radio-button style selections for better UX
- **Form Validation**: Real-time validation with custom error messages
- **Response Management**: View, export, and manage form submissions
- **File Handling**: Secure file uploads with type and size restrictions

### 🔔 **Smart Notifications**
- **Real-time Notifications**: Instant updates for important events
- **Event Reminders**: Automated reminders before events start
- **RSVP Confirmations**: Immediate feedback on registration actions
- **Form Responses**: Notifications for new form submissions
- **Community Updates**: Stay informed about community activities
- **Notification Preferences**: Granular control over notification types

### 🔍 **Intelligent Search**
- **Debounced Search**: Smooth, responsive search experience
- **Multi-entity Search**: Search across events and communities simultaneously
- **Real-time Results**: Instant search results as you type
- **Smart Filtering**: Context-aware search with proper categorization

### 📱 **Modern User Experience**
- **Progressive Web App**: Install as a native app on any device
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Dark/Light Mode**: Automatic theme switching with user preferences
- **Accessibility**: WCAG compliant with keyboard navigation support
- **Offline Support**: Core functionality works without internet connection

### 🔐 **Security & Authentication**
- **Multi-provider Auth**: Google OAuth and email/password authentication
- **Email Verification**: Secure account verification with OTP
- **Session Management**: Secure session handling with NextAuth.js
- **Role-based Access**: Admin, operator, and user role management
- **Data Protection**: Encrypted data transmission and storage

---

## 🎨 User Interface Highlights

### 🏠 **Dashboard & Navigation**
- Clean, intuitive navigation with search integration
- Personalized dashboard with relevant content
- Quick access to frequently used features

### 📅 **Calendar Integration**
- Beautiful calendar view for event visualization
- Month/week/day views with event details
- Easy event creation directly from calendar

### 📊 **Analytics & Insights**
- Event attendance tracking
- Community growth metrics
- Form response analytics
- Export capabilities for data analysis

### 🎯 **Event Pages**
- Rich event details with media galleries
- Interactive maps for event locations
- Social sharing capabilities
- Related events suggestions

---

## 🛠️ Technology Stack

### **Frontend Architecture**
| Technology | Purpose | Version |
|------------|---------|---------|
| [Next.js](https://nextjs.org/) | React Framework | 14.x |
| [React](https://react.dev/) | UI Library | 18.x |
| [TypeScript](https://www.typescriptlang.org/) | Type Safety | 5.x |
| [Tailwind CSS](https://tailwindcss.com/) | Styling Framework | 3.x |

### **UI Components & Design**
| Technology | Purpose |
|------------|---------|
| [shadcn/ui](https://ui.shadcn.com/) | Component Library |
| [Radix UI](https://www.radix-ui.com/) | Headless Components |
| [Lucide Icons](https://lucide.dev/) | Icon System |
| [Framer Motion](https://www.framer.com/motion/) | Animations |

### **State Management & Forms**
| Technology | Purpose |
|------------|---------|
| [React Hook Form](https://react-hook-form.com/) | Form Management |
| [Zod](https://zod.dev/) | Schema Validation |
| [cmdk](https://cmdk.paco.me/) | Command Palette |

### **Backend & Database**
| Technology | Purpose |
|------------|---------|
| [MongoDB](https://www.mongodb.com/) | Primary Database |
| [NextAuth.js](https://next-auth.js.org/) | Authentication |
| [Nodemailer](https://nodemailer.com/) | Email Service |

### **Cloud Services & Media**
| Technology | Purpose |
|------------|---------|
| [Cloudinary](https://cloudinary.com/) | Media Management |
| [next-cloudinary](https://www.npmjs.com/package/next-cloudinary) | Cloudinary Integration |

### **Development & Build Tools**
| Technology | Purpose |
|------------|---------|
| [next-pwa](https://github.com/shadowwalker/next-pwa) | PWA Support |
| [QRCode](https://www.npmjs.com/package/qrcode) | QR Generation |
| [xlsx](https://www.npmjs.com/package/xlsx) | Excel Export |
| [date-fns](https://date-fns.org/) | Date Utilities |

---

## 🚀 Quick Start

### **Prerequisites**
- **Node.js** (v18+ recommended)
- **MongoDB** instance (local or cloud)
- **Cloudinary** account for media management
- **Google OAuth** credentials (optional)
- **SMTP** server for email notifications

### **Installation**

```bash
# 1. Clone the repository
git clone https://github.com/namansharma28/gravitas
cd gravitas

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
```

### **Environment Configuration**

Create a `.env.local` file with the following variables:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/gravitas

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### **Development**

```bash
# Start the development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

Visit [http://localhost:3000](http://localhost:3000) to view the application.

---

## 📁 Project Architecture

```
gravitas/
├── 📂 app/                          # Next.js App Router
│   ├── 📂 api/                      # API Routes
│   │   ├── 📂 auth/                 # Authentication endpoints
│   │   ├── 📂 events/               # Event management APIs
│   │   ├── 📂 communities/          # Community APIs
│   │   ├── 📂 notifications/        # Notification system
│   │   └── 📂 search/               # Search functionality
│   ├── 📂 (auth)/                   # Authentication pages
│   ├── 📂 events/                   # Event pages
│   ├── 📂 communities/              # Community pages
│   ├── 📂 settings/                 # User settings
│   └── 📂 admin/                    # Admin dashboard
├── 📂 components/                   # Reusable Components
│   ├── 📂 ui/                       # Base UI components
│   ├── 📂 layout/                   # Layout components
│   ├── 📂 forms/                    # Form components
│   ├── 📂 events/                   # Event-specific components
│   ├── 📂 communities/              # Community components
│   └── 📂 notifications/            # Notification components
├── 📂 lib/                          # Utility Libraries
│   ├── 📄 auth.ts                   # Authentication config
│   ├── 📄 mongodb.ts                # Database connection
│   ├── 📄 email.ts                  # Email utilities
│   └── 📄 utils.ts                  # General utilities
├── 📂 public/                       # Static Assets
│   ├── 📂 icons/                    # PWA icons
│   └── 📄 manifest.json             # PWA manifest
└── 📂 types/                        # TypeScript definitions
```

---

## 🎯 Key Features Deep Dive

### **🔧 Form Builder System**
The advanced form builder allows creating dynamic forms with:
- **Multiple Field Types**: Text, email, number, select, checkbox, file upload
- **Single Choice Checkboxes**: Radio-button behavior for better UX
- **Real-time Validation**: Instant feedback with Zod schema validation
- **File Upload Support**: Secure file handling with type/size restrictions
- **Response Management**: Export to Excel, view analytics

### **📱 Notification System**
Comprehensive notification system featuring:
- **Real-time Notifications**: WebSocket-based instant updates
- **Event Reminders**: Automated scheduling before events
- **Email Integration**: SMTP-based email notifications
- **Push Notifications**: PWA push notification support
- **Granular Preferences**: User-controlled notification settings

### **🔍 Search & Discovery**
Intelligent search system with:
- **Debounced Search**: 300ms delay for optimal performance
- **Multi-entity Results**: Events and communities in one search
- **Real-time Filtering**: Instant results as you type
- **Smart Categorization**: Organized results with proper sections

### **📊 Analytics Dashboard**
Comprehensive analytics including:
- **Event Metrics**: Attendance, registration rates, check-ins
- **Community Growth**: Member acquisition, engagement rates
- **Form Analytics**: Response rates, completion statistics
- **Export Capabilities**: CSV/Excel export for external analysis

---

## 🎨 Design System

### **Color Palette**
- **Primary**: Modern blue gradient system
- **Secondary**: Purple to pink gradients for communities
- **Semantic**: Success (green), warning (orange), error (red)
- **Neutral**: Comprehensive gray scale for text and backgrounds

### **Typography**
- **Headings**: Inter font family for clarity
- **Body**: Optimized for readability across devices
- **Code**: Monospace for technical content

### **Components**
- **Consistent Spacing**: 4px grid system
- **Border Radius**: Consistent rounded corners
- **Shadows**: Subtle elevation system
- **Animations**: Smooth transitions and micro-interactions

---

## 🔒 Security Features

### **Authentication & Authorization**
- **Multi-provider Support**: Google OAuth, email/password
- **Email Verification**: OTP-based account verification
- **Session Security**: Secure JWT token management
- **Role-based Access**: Admin, operator, user permissions

### **Data Protection**
- **Input Validation**: Server-side validation with Zod
- **SQL Injection Prevention**: MongoDB parameterized queries
- **XSS Protection**: Content sanitization
- **CSRF Protection**: Built-in Next.js CSRF protection

### **Privacy & Compliance**
- **Data Encryption**: Encrypted data transmission (HTTPS)
- **User Consent**: Clear privacy policies and consent flows
- **Data Export**: User data portability options
- **Account Deletion**: Complete data removal capabilities

---

## 📱 Progressive Web App Features

### **Installation**
- **Add to Home Screen**: One-click installation on mobile/desktop
- **App-like Experience**: Native app feel with custom splash screen
- **Offline Support**: Core functionality works without internet

### **Performance**
- **Service Worker**: Intelligent caching strategies
- **Code Splitting**: Optimized bundle loading
- **Image Optimization**: Next.js automatic image optimization
- **Lazy Loading**: Components loaded on demand

---

## 🌐 Deployment & Scaling

### **Recommended Hosting**
- **Vercel**: Optimal for Next.js applications
- **Netlify**: Alternative with great CI/CD
- **Railway**: Full-stack deployment with database

### **Database Scaling**
- **MongoDB Atlas**: Managed MongoDB with auto-scaling
- **Connection Pooling**: Optimized database connections
- **Indexing Strategy**: Optimized queries for performance

### **CDN & Media**
- **Cloudinary**: Automatic image optimization and delivery
- **Edge Caching**: Global content delivery
- **Lazy Loading**: Reduced initial load times

---

## 🧪 Testing Strategy

### **Unit Testing**
```bash
# Run unit tests
npm run test

# Run tests with coverage
npm run test:coverage
```

### **Integration Testing**
- API endpoint testing
- Database integration tests
- Authentication flow testing

### **E2E Testing**
- User journey testing
- Cross-browser compatibility
- Mobile responsiveness testing

---

## 📈 Performance Metrics

### **Core Web Vitals**
- **LCP**: < 2.5s (Largest Contentful Paint)
- **FID**: < 100ms (First Input Delay)
- **CLS**: < 0.1 (Cumulative Layout Shift)

### **Optimization Techniques**
- **Image Optimization**: WebP format with fallbacks
- **Code Splitting**: Route-based and component-based
- **Caching Strategy**: Intelligent service worker caching
- **Bundle Analysis**: Regular bundle size monitoring

---

## 🤝 Contributing

We welcome contributions from the community! Whether you're fixing bugs, adding features, or improving documentation, your help is appreciated.

### **Getting Started**
1. **Fork** the repository
2. **Clone** your fork locally
3. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
4. **Make** your changes
5. **Test** your changes thoroughly
6. **Commit** with descriptive messages (`git commit -m 'Add amazing feature'`)
7. **Push** to your branch (`git push origin feature/amazing-feature`)
8. **Open** a Pull Request

### **Development Guidelines**
- Follow the existing code style and conventions
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

### **Code Style**
- Use TypeScript for type safety
- Follow ESLint and Prettier configurations
- Use semantic HTML and accessible components
- Write self-documenting code with clear variable names

### **Reporting Issues**
- Use the GitHub issue tracker
- Provide detailed reproduction steps
- Include screenshots for UI issues
- Specify your environment (OS, browser, Node.js version)

---

## 📚 Documentation

### **API Documentation**
- **Authentication**: `/api/auth/*` - NextAuth.js endpoints
- **Events**: `/api/events/*` - Event management
- **Communities**: `/api/communities/*` - Community operations
- **Forms**: `/api/events/[id]/forms/*` - Dynamic form system
- **Notifications**: `/api/notifications/*` - Notification system
- **Search**: `/api/search` - Global search functionality

### **Component Documentation**
- **UI Components**: Documented with Storybook (coming soon)
- **Form Components**: Reusable form building blocks
- **Layout Components**: Navigation, headers, footers
- **Feature Components**: Event cards, community headers, etc.

---

## 🔧 Troubleshooting

### **Common Issues**

**Database Connection Issues**
```bash
# Check MongoDB connection
mongosh "your-mongodb-uri"

# Verify environment variables
echo $MONGODB_URI
```

**Authentication Problems**
```bash
# Clear Next.js cache
rm -rf .next

# Rebuild the application
npm run build
```

**Build Errors**
```bash
# Clear all caches
npm run clean
npm install

# Check for TypeScript errors
npm run type-check
```

### **Performance Issues**
- Enable MongoDB indexing for better query performance
- Optimize images using Cloudinary transformations
- Monitor bundle size with `npm run analyze`
- Use React DevTools Profiler for component optimization

---

## 🚀 Roadmap

### **Upcoming Features**
- [ ] **Mobile App**: React Native companion app
- [ ] **Advanced Analytics**: Detailed event and community insights
- [ ] **Integration APIs**: Third-party calendar and social media integration
- [ ] **AI Recommendations**: Smart event and community suggestions
- [ ] **Live Streaming**: Built-in video streaming for virtual events
- [ ] **Marketplace**: Event ticketing and merchandise system

### **Technical Improvements**
- [ ] **Microservices**: Break down into smaller, scalable services
- [ ] **GraphQL**: Implement GraphQL for more efficient data fetching
- [ ] **Real-time Chat**: WebSocket-based messaging system
- [ ] **Advanced Caching**: Redis integration for better performance
- [ ] **Monitoring**: Application performance monitoring (APM)

---

## 📊 Project Stats

<p align="center">
  <img src="https://img.shields.io/github/stars/namansharma28/gravitas?style=for-the-badge" alt="Stars"/>
  <img src="https://img.shields.io/github/forks/namansharma28/gravitas?style=for-the-badge" alt="Forks"/>
  <img src="https://img.shields.io/github/issues/namansharma28/gravitas?style=for-the-badge" alt="Issues"/>
  <img src="https://img.shields.io/github/license/namansharma28/gravitas?style=for-the-badge" alt="License"/>
</p>

---

## 🙏 Acknowledgments

- **Next.js Team** for the amazing React framework
- **Vercel** for hosting and deployment platform
- **shadcn** for the beautiful UI component library
- **MongoDB** for the flexible database solution
- **Cloudinary** for media management services
- **All Contributors** who have helped improve this project

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 📞 Support

Need help? Reach out to us:

- **GitHub Issues**: [Report bugs or request features](https://github.com/namansharma28/gravitas/issues)
- **Discussions**: [Join community discussions](https://github.com/namansharma28/gravitas/discussions)
- **Email**: [Contact the maintainers](mailto:support@gravitas.dev)

---

<p align="center">
  <img src="public/logo.svg" alt="Gravitas Logo" width="60"/>
</p>

<p align="center">
  <b>🎯 Gravitas – Empowering Communities, One Event at a Time</b><br>
  <i>Built with ❤️ by Naman</i>
</p>

<p align="center">
  <a href="https://gravitas.dev">🌐 Live Demo</a> •
  <a href="#-quick-start">🚀 Get Started</a> •
  <a href="#-contributing">🤝 Contribute</a> •
  <a href="#-documentation">📚 Docs</a>
</p>


---

## 🗄️ Database Indexes

For optimal query performance, create database indexes after setting up MongoDB:

```bash
# Create all indexes
node scripts/create-indexes.js

# Verify indexes
node scripts/create-indexes.js verify
```

**Performance Impact**: 3-10x faster queries on large collections

**Indexes Created**:
- Communities: handle (unique), status, members, admins, text search
- Events: communityId+date, date, text search
- Follows: userId+communityId (unique), userId, communityId
- Users: email (unique)
- And more...

📚 **Full Documentation**: See [DATABASE_INDEXES.md](./DATABASE_INDEXES.md) for complete index documentation.

---

## 📚 Additional Documentation

- **[PERFORMANCE_IMPLEMENTATION.md](./PERFORMANCE_IMPLEMENTATION.md)** - Performance optimizations guide
- **[SECURITY_IMPLEMENTATION.md](./SECURITY_IMPLEMENTATION.md)** - Security features and best practices
- **[SENTRY_SETUP.md](./SENTRY_SETUP.md)** - Error monitoring setup guide
- **[DATABASE_INDEXES.md](./DATABASE_INDEXES.md)** - Database indexes documentation
- **[IMPROVEMENT_RECOMMENDATIONS.md](./IMPROVEMENT_RECOMMENDATIONS.md)** - Future improvements roadmap
- **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Quick reference for common tasks
