# AgroPulse Nepal

Nepal's leading agricultural news portal and digital marketplace.

## Features

- 🌾 Agricultural news and updates
- 📊 Real-time market prices
- 🌤️ Weather information
- 💬 Expert consultation
- 🛒 Digital marketplace
- 📱 Responsive design
- 🔐 Secure authentication

## Tech Stack

### Frontend
- React 19
- TypeScript
- Vite
- TailwindCSS 4
- i18next (Internationalization)

### Backend
- Express.js
- TypeScript
- PostgreSQL
- Redis
- JWT Authentication

### Infrastructure
- Docker & Docker Compose
- AWS (ECS, RDS, ElastiCache, ECR)
- Terraform
- GitHub Actions (CI/CD)
- Nginx

## Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- PostgreSQL (optional for local dev)
- Redis (optional for local dev)

### Local Development

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd Website-creation-
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start with Docker Compose (Recommended)**
```bash
docker-compose up -d
```

Or run manually:

```bash
# Start backend
npm run dev:api

# Start frontend (in another terminal)
npm run dev:web
```

5. **Access the application**
- Frontend: http://localhost:80
- API: http://localhost:3000
- API Health: http://localhost:3000/api/health

## Deployment

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

### Quick Deploy to AWS

```bash
# Push to main branch (triggers GitHub Actions)
git push origin main
```

## Project Structure

```
├── apps/
│   ├── api/          # Backend API (Express.js)
│   └── web/          # Frontend (React + Vite)
├── infra/
│   ├── docker/       # Docker configurations
│   └── terraform/    # AWS infrastructure
├── .github/workflows/ # CI/CD pipelines
└── docker-compose.yml
```

## Environment Variables

See [.env.example](.env.example) for required variables.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary and confidential.

## Support

For support, contact: support@agropulse.com.np
