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
- **Backend**: Python FastAPI
- **Authentication**: Clerk
- **Styling**: Tailwind CSS v4
- **UI Components**: ShadCN UI, KiboUI components
- **Icons**: Lucide React
- **Animations**: Motion (Framer Motion)

## Project Structure

```
ae-cipher/
├── src/
│   ├── app/                  # Next.js app router
│   ├── components/           # React components
│   │   ├── ui/              # UI components (Button, Card, etc.)
│   │   ├── cipher-component.tsx
│   │   └── theme-provider.tsx
│   └── lib/
│       └── utils.ts         # Utility functions
├── AECipher.py              # Original Python cipher (CLI version)
├── cipher_api.py            # FastAPI server
├── requirements.txt         # Python dependencies
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

You need to run both the Python API server and the Next.js frontend.

### Method 1: Manual (Two Terminals)

**Terminal 1 - Python API Server:**
```bash
python cipher_api.py
```
The API will be available at: `http://localhost:8000`

**Terminal 2 - Next.js Frontend:**
```bash
npm run dev
```
The web app will be available at: `http://localhost:3000`

### Method 2: Using Scripts (Recommended)

**For Windows PowerShell:**
```powershell
# Start both servers
.\start-servers.ps1

# Or start them individually:
.\start-api.ps1     # Start Python API
.\start-web.ps1     # Start Next.js web app
```

## Usage

1. **Open the web app**: Navigate to `http://localhost:3000`
2. **Set your password**: Enter a secure password in the settings
3. **Choose rounds**: Set the number of encryption rounds (default: 3)
4. **Encrypt text**: 
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
