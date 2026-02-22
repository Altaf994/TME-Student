# Abacus App - Modern React Boilerplate

A comprehensive, production-ready React boilerplate with all the essential tools and components for building modern web applications.

## 🚀 Features

- **Modern React** with hooks and context
- **Type-safe forms** with React Hook Form + Zod validation
- **Authentication system** with JWT tokens
- **Responsive design** with Tailwind CSS
- **API integration** with Axios and React Query
- **Error handling** with error boundaries
- **Loading states** and user feedback
- **SEO optimized** with React Helmet
- **Accessibility compliant** components
- **Code formatting** with Prettier and ESLint
- **Git hooks** with Husky

## 📦 Tech Stack

- **Frontend**: React 19, React Router DOM
- **Styling**: Tailwind CSS, Lucide React icons
- **Forms**: React Hook Form, Zod validation
- **State Management**: React Query, Context API
- **HTTP Client**: Axios with interceptors
- **Notifications**: React Hot Toast
- **SEO**: React Helmet Async
- **Error Handling**: React Error Boundary
- **Code Quality**: ESLint, Prettier, Husky

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd abacus-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**

   ```bash
   cp env.example .env
   ```

   Edit `.env` with your configuration.

4. **Start the development server**

   ```bash
   npm start
   # or
   yarn start
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── common/         # Common components (ErrorBoundary, ProtectedRoute)
│   ├── layout/         # Layout components (Header, Footer, Layout)
│   └── ui/             # Base UI components (Button, Input, Card)
├── hooks/              # Custom React hooks
├── pages/              # Page components
├── utils/              # Utility functions
│   ├── api.js          # API configuration and methods
│   ├── cn.js           # Class name utility
│   ├── format.js       # Formatting utilities
│   └── validation.js   # Validation schemas
└── App.js              # Main application component
```

## 🔧 Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier

## 🎨 Component Library

### UI Components

- **Button** - Multiple variants (default, outline, secondary, etc.)
- **Input** - Form inputs with validation support
- **Card** - Content containers with header, content, and footer
- **LoadingSpinner** - Loading indicators

### Layout Components

- **Header** - Navigation with user menu
- **Footer** - Site footer with links
- **Layout** - Page wrapper with header/footer

### Auth Components

- **LoginForm** - User login with validation
- **RegisterForm** - User registration with validation

### Common Components

- **ErrorBoundary** - Error catching and display
- **ProtectedRoute** - Route protection based on authentication
- **NotFound** - 404 error page

## 🔐 Authentication

The boilerplate includes a complete authentication system:

- JWT token management
- Automatic token refresh
- Protected routes
- Login/Register forms
- User context

### Usage

```jsx
import { useAuth } from './hooks/useAuth';

function MyComponent() {
  const { user, login, logout, isAuthenticated } = useAuth();

  // Use authentication methods
}
```

## 📡 API Integration

Configured with Axios and React Query for efficient API calls:

- Automatic token injection
- Error handling
- Request/response interceptors
- Caching and background updates

### Usage

```jsx
import { apiService } from './utils/api';

// GET request
const data = await apiService.get('/users');

// POST request
const result = await apiService.post('/users', userData);
```

## 🎯 Form Handling

Built-in form validation with React Hook Form and Zod:

```jsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm({
  resolver: zodResolver(schema),
});
```

## 🎨 Styling

Uses Tailwind CSS with custom configuration:

- Custom color palette
- Responsive design utilities
- Custom animations
- Component-based styling

## 🔧 Configuration

### Environment Variables

Create a `.env` file based on `env.example`:

```env
REACT_APP_API_BASE_URL=http://localhost:3001/api
REACT_APP_AUTH_TOKEN_KEY=abacus_auth_token
REACT_APP_ENABLE_DEBUG_MODE=false
```

### Tailwind Configuration

Customize colors, fonts, and utilities in `tailwind.config.js`.

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Environment Setup

Ensure all environment variables are set in your production environment.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check the documentation
- Review the code examples

## 🔄 Updates

Keep your boilerplate updated:

```bash
npm update
npm audit fix
```

---

Built with ❤️ for modern web development
# TME-Student
