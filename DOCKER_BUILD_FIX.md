# Docker Build Troubleshooting Guide

## Recent Fixes Applied

### ✅ Fixed: Web Dockerfile Build Error

**Problem**: `npm run build --workspace=apps/web` was failing

**Root Cause**: The Dockerfile was copying the web app to `/app` directory and then trying to run workspace command, but workspaces only work from the monorepo root.

**Solution**: 
- Simplified the Dockerfile to copy web app directly to `/app`
- Changed build command from `npm run build --workspace=apps/web` to `npm run build`
- Fixed dist output path from `/app/apps/web/dist` to `/app/dist`

### ✅ Fixed: API Dockerfile Structure

**Problem**: Similar workspace issue and unnecessary directory changes

**Solution**:
- Simplified to copy API directly to `/app`
- Removed unnecessary `WORKDIR` change
- Cleaner build process

---

## How to Test Docker Builds Locally

### Test Web Build
```bash
# From project root
docker build -t agropulse-web-test -f infra/docker/web.Dockerfile .

# Test the image
docker run -p 8080:80 agropulse-web-test
# Visit http://localhost:8080
```

### Test API Build
```bash
# From project root
docker build -t agropulse-api-test -f infra/docker/api.Dockerfile .

# Test the image
docker run -p 3000:3000 agropulse-api-test
# Visit http://localhost:3000/api/health
```

### Test Full Stack
```bash
# From project root
docker-compose up --build -d

# Check logs
docker-compose logs -f web
docker-compose logs -f api

# Stop when done
docker-compose down
```

---

## Common Build Errors & Solutions

### Error 1: "npm run build --workspace" fails
**Cause**: Workspace commands only work from monorepo root with all workspace packages present

**Solution**: 
- Don't use `--workspace` flag in individual app Dockerfiles
- Copy only the specific app's files
- Run build commands directly

### Error 2: "Cannot find module" or missing dependencies
**Cause**: package.json not copied before `npm install`

**Solution**:
- Always copy package.json first
- Run `npm install`
- Then copy source code

### Error 3: "dist directory not found"
**Cause**: Build output path mismatch

**Solution**:
- Check where Vite/TypeScript outputs the build
- Default for Vite is `./dist` from the app directory
- Update COPY command to match

### Error 4: TypeScript compilation errors
**Cause**: Missing type definitions or configuration issues

**Solution**:
```bash
# Check TypeScript locally first
cd apps/web
npm install
npm run lint  # or npx tsc --noEmit
```

### Error 5: "Cannot find vite" or build tools
**Cause**: devDependencies not installed

**Solution**:
- Ensure `npm install` is run without `--production` flag in build stage
- Vite must be installed for build (it's a devDependency)

---

## Dockerfile Best Practices Applied

### ✅ Layer Caching
```dockerfile
# Copy package.json first (changes less frequently)
COPY apps/web/package.json ./
RUN npm install

# Then copy source code (changes frequently)
COPY apps/web/ ./
```

### ✅ Multi-Stage Builds
```dockerfile
# Build stage
FROM node:20-alpine AS build-stage
# ... build the app ...

# Production stage
FROM nginx:stable-alpine AS production-stage
# ... copy only the built files ...
```

### ✅ Minimal Image Size
- Use `alpine` base images
- Only copy necessary files
- Don't include node_modules in production for static sites

---

## Verification Checklist

Before pushing to GitHub, verify:

- [ ] Web Dockerfile builds locally: `docker build -f infra/docker/web.Dockerfile .`
- [ ] API Dockerfile builds locally: `docker build -f infra/docker/api.Dockerfile .`
- [ ] Docker-compose works: `docker-compose up -d`
- [ ] Web app accessible at http://localhost:80
- [ ] API accessible at http://localhost:3000
- [ ] API health check passes: http://localhost:3000/api/health

---

## GitHub Actions Debugging

If build fails in GitHub Actions:

### 1. Check the full error log
```yaml
# The error will show exactly which command failed
# Look for the step that failed
```

### 2. Common GitHub Actions Issues

**Issue**: Files not found
```
# Check .dockerignore isn't excluding needed files
# Verify file paths in Dockerfile match repo structure
```

**Issue**: Out of memory
```yaml
# Add to workflow:
- name: Build Web
  run: |
    export NODE_OPTIONS="--max-old-space-size=4096"
    docker build ...
```

**Issue**: npm install fails
```
# Check package.json is valid
# Verify all dependencies exist
# Check for private registry requirements
```

---

## Current Dockerfile Structure

### Web App (infra/docker/web.Dockerfile)
```dockerfile
FROM node:20-alpine AS build-stage
WORKDIR /app
COPY apps/web/package.json ./        # Copy package.json
RUN npm install                       # Install dependencies
COPY apps/web/ ./                     # Copy source code
RUN npm run build                     # Build the app

FROM nginx:stable-alpine AS production-stage
COPY infra/docker/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build-stage /app/dist /usr/share/nginx/html
```

### API (infra/docker/api.Dockerfile)
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY apps/api/package.json ./        # Copy package.json
RUN npm install                       # Install dependencies
COPY apps/api/ ./                     # Copy source code
EXPOSE 3000
CMD ["npx", "tsx", "src/server.ts"]  # Run with tsx
```

---

## Quick Fix Commands

If you encounter build issues:

```bash
# Clean Docker cache
docker system prune -a

# Rebuild without cache
docker build --no-cache -f infra/docker/web.Dockerfile .

# Check Dockerfile syntax
docker build --check -f infra/docker/web.Dockerfile .

# Test with verbose output
docker build --progress=plain -f infra/docker/web.Dockerfile .
```

---

## Success Criteria

Your Docker build is successful when:

1. ✅ Web image builds without errors
2. ✅ API image builds without errors
3. ✅ Web serves React app on port 80
4. ✅ API responds to health checks on port 3000
5. ✅ GitHub Actions workflow completes successfully

---

**Last Updated**: After fixing workspace build error
**Status**: ✅ All Dockerfiles corrected and ready for deployment
