# AE Cipher - Secure Text Encryption

A modern, user-friendly web application for encrypting and decrypting text using a custom cipher algorithm with multi-round password-based security.

## Features

- 🔐 **Secure Encryption**: Multi-round password-based cipher with evolving keys
- 🔒 **User Authentication**: Secure sign-in/sign-up with Clerk
- 🌓 **Dark Mode**: Built-in theme switcher (light/dark/system)
- 📋 **Copy to Clipboard**: Easy copying of encrypted/decrypted results
- 🎨 **Modern UI**: Clean, responsive design using Tailwind CSS v4
- ⚡ **Fast API**: Python FastAPI backend for encryption operations
- 🛡️ **Error Handling**: Comprehensive error handling and validation

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Next.js API Routes (TypeScript)
- **Authentication**: Clerk
- **Styling**: Tailwind CSS v4
- **UI Components**: ShadCN UI, KiboUI components
- **Icons**: Lucide React
- **Animations**: Motion (Framer Motion)
- **Deployment**: Vercel

## Project Structure

```
ae-cipher/
├── src/
│   ├── app/                  # Next.js app router
│   │   ├── api/             # API routes (cipher functionality)
│   │   ├── profile/         # User profile page
│   │   ├── layout.tsx       # Root layout with Clerk
│   │   └── page.tsx         # Home page
│   ├── components/          # React components
│   │   ├── ui/             # UI components (Button, Card, etc.)
│   │   ├── bits/           # Custom components (animations)
│   │   ├── cipher-component.tsx
│   │   └── theme-provider.tsx
│   ├── lib/                # Utilities and core logic
│   │   ├── cipher.ts       # TypeScript cipher implementation
│   │   ├── auth.ts         # Client-side auth utilities
│   │   ├── auth-server.ts  # Server-side auth utilities
│   │   └── utils.ts        # General utilities
│   └── middleware.ts       # Clerk authentication middleware
├── backend/                 # Original Python implementation (reference)
│   ├── AECipher.py         # CLI version
│   ├── cipher_api.py       # FastAPI server (deprecated)
│   └── requirements.txt    # Python dependencies (deprecated)
└── package.json            # Node.js dependencies
```

## Installation & Setup

### Prerequisites

- Node.js 18+ and npm
- Python 3.8+
- Git

### 1. Clone and Navigate

```bash
cd "c:\Users\Ammar\OneDrive\Documents\MCA - MPSTME\Semester 3\CS\Assignment1\ae-cipher"
```

### 2. Install Node.js Dependencies

```bash
npm install
```

### 3. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 4. Set up Authentication

1. Create a [Clerk account](https://clerk.com) and create a new application
2. Copy your API keys from the [Clerk Dashboard](https://dashboard.clerk.com/last-active?path=api-keys)
3. Create a `.env.local` file in the project root:

```bash
# Clerk Environment Variables
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key_here
CLERK_SECRET_KEY=your_secret_key_here
```

Replace `your_publishable_key_here` and `your_secret_key_here` with your actual Clerk keys.

## Running the Application

The application now runs entirely on Next.js with TypeScript, so you only need to start one server.

### Development

```bash
npm run dev
```
The web app will be available at: `http://localhost:3000`

### Production

```bash
npm run build
npm start
```

### Deployment

The application is ready for deployment on Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
4. Deploy!

## Usage

1. **Open the web app**: Navigate to your application URL
2. **Sign in/Sign up**: Create an account or sign in with Clerk
3. **Set your password**: Enter a secure password for encryption
4. **Choose rounds**: Set the number of encryption rounds (default: 3)
5. **Encrypt text**: 
   - Enter your plaintext in the encryption panel
   - Click "Encrypt" to generate Base64 ciphertext
   - Copy the result using the copy button
5. **Decrypt text**:
   - Paste the ciphertext in the decryption panel
   - Use the same password and rounds as encryption
   - Click "Decrypt" to reveal the original text

## API Endpoints

The Python FastAPI server provides these endpoints:

- `POST /encrypt` - Encrypt plaintext
- `POST /decrypt` - Decrypt ciphertext  
- `GET /health` - Health check

### Example API Usage

```bash
# Encrypt
curl -X POST "http://localhost:8000/encrypt" \
  -H "Content-Type: application/json" \
  -d '{"plaintext": "Hello World", "password": "secret", "rounds": 3}'

# Decrypt
curl -X POST "http://localhost:8000/decrypt" \
  -H "Content-Type: application/json" \
  -d '{"ciphertext": "base64_here", "password": "secret", "rounds": 3}'
```

## Security Features

- **Multi-round encryption**: Each round uses an evolved key derived from the password
- **Base64 encoding**: Safe copy/paste of encrypted data
- **Password-based key derivation**: Keys are generated from password + "Ammar" string
- **Deterministic key evolution**: Consistent encryption/decryption process

## Development

### Building for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

### API Documentation

With the Python server running, visit: `http://localhost:8000/docs`

## Troubleshooting

### Common Issues

1. **"Failed to connect to cipher API"**
   - Ensure the Python server is running on port 8000
   - Check that no firewall is blocking the connection

2. **"Base64 decode error"**
   - Verify the ciphertext is valid Base64
   - Ensure you're using the exact same password and rounds for decryption

3. **Theme not switching**
   - Clear browser cache and localStorage
   - Refresh the page

### Port Conflicts

If ports 3000 or 8000 are busy:

```bash
# Change Next.js port
npm run dev -- -p 3001

# Change Python API port (edit cipher_api.py line 177)
uvicorn.run(app, host="0.0.0.0", port=8001)
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is for educational purposes as part of the MCA program at MPSTME.

## Acknowledgments

- Built using ShadCN UI components
- Inspired by modern cryptographic practices
- Created for academic assignment requirements
