#!/bin/bash

echo "🚀 Starting deployment..."

# Build the application
echo "📦 Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

# Create deployment package
echo "📁 Creating deployment package..."
tar -czf deployment.tar.gz .output package.json package-lock.json

# Upload to server
echo "⬆️  Uploading to server..."
scp deployment.tar.gz root@109.123.250.133:/var/www/html/prosper_enterprise/

if [ $? -ne 0 ]; then
    echo "❌ Upload failed!"
    rm deployment.tar.gz
    exit 1
fi

# Deploy on server
echo "🔄 Deploying on server..."
ssh root@109.123.250.133 << 'EOF'
cd /var/www/html/prosper_enterprise
echo "📂 Extracting files..."
tar -xzf deployment.tar.gz
echo "📦 Installing dependencies..."
npm ci --omit=dev --ignore-scripts
echo "🔄 Starting/Restarting application..."
# Check if nuxt-app process exists
if pm2 list | grep -q "nuxt-app"; then
    echo "📱 Restarting existing PM2 process..."
    pm2 restart nuxt-app
else
    echo "🆕 Creating new PM2 process..."
    # Start the application with PM2
    pm2 start npm --name "nuxt-app" -- start
    # Save PM2 process list
    pm2 save
fi
echo "⏳ Waiting for application to start..."
sleep 10
echo "🔍 Checking application health..."

# Health check function
check_health() {
    local max_attempts=6
    local attempt=1
    local wait_time=10
    
    while [ $attempt -le $max_attempts ]; do
        echo "🔄 Health check attempt $attempt/$max_attempts..."
        
        # Check if PM2 process is running
        if pm2 list | grep -q "nuxt-app.*online"; then
            echo "✅ PM2 process is running"
            
            # Check if application responds to HTTP requests
            if curl -f -s -o /dev/null --max-time 10 http://localhost:3000 || \
               curl -f -s -o /dev/null --max-time 10 https://enterprise.prospermentor.com; then
                echo "✅ Application is responding to requests"
                echo "🎉 Health check passed!"
                return 0
            else
                echo "⚠️  Application not responding to HTTP requests"
            fi
        else
            echo "❌ PM2 process is not running properly"
        fi
        
        if [ $attempt -lt $max_attempts ]; then
            echo "⏳ Waiting ${wait_time}s before next attempt..."
            sleep $wait_time
        fi
        
        attempt=$((attempt + 1))
    done
    
    echo "❌ Health check failed after $max_attempts attempts"
    echo "📊 PM2 Status:"
    pm2 status nuxt-app
    echo "📋 Recent logs:"
    pm2 logs nuxt-app --lines 20 --nostream
    return 1
}

# Run health check
if check_health; then
    echo "✅ Application is healthy and running!"
else
    echo "❌ Application health check failed!"
    echo "🔧 Deployment completed but application may not be working correctly"
fi

echo "🧹 Cleaning up..."
rm deployment.tar.gz
echo "✅ Server deployment completed!"
EOF

# Clean up locally
rm deployment.tar.gz

echo "🎉 Deployment completed successfully!"
echo "🌐 Your site should be updated at: https://enterprise.prospermentor.com"
