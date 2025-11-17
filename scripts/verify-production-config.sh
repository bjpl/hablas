#!/bin/bash

# Production Configuration Verification Script
# This script helps verify your production configuration is complete

echo "🔍 Production Configuration Verification"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo -e "${RED}❌ .env.local file not found${NC}"
    echo "   Please create .env.local from .env.example"
    exit 1
fi

echo -e "${GREEN}✅ .env.local file found${NC}"
echo ""

# Function to check if variable is set and not a placeholder
check_var() {
    local var_name=$1
    local var_value=$(grep "^${var_name}=" .env.local | cut -d '=' -f2-)
    local is_required=$2

    if [ -z "$var_value" ]; then
        if [ "$is_required" = "required" ]; then
            echo -e "${RED}❌ $var_name: Not set (REQUIRED)${NC}"
            return 1
        else
            echo -e "${YELLOW}⚠️  $var_name: Not set (optional)${NC}"
            return 0
        fi
    fi

    # Check for placeholder values
    if [[ $var_value == *"your-"* ]] || [[ $var_value == *"change-this"* ]] || [[ $var_value == *"example"* ]]; then
        echo -e "${YELLOW}⚠️  $var_name: Contains placeholder (needs update)${NC}"
        return 1
    fi

    echo -e "${GREEN}✅ $var_name: Configured${NC}"
    return 0
}

echo "Checking Critical Security Settings:"
echo "-----------------------------------"
check_var "JWT_SECRET" "required"
check_var "REFRESH_TOKEN_SECRET" "required"
check_var "ADMIN_PASSWORD" "required"
echo ""

echo "Checking Database Configuration:"
echo "-------------------------------"
check_var "DATABASE_URL" "required"
check_var "DB_SSL" "optional"
echo ""

echo "Checking CORS Configuration:"
echo "---------------------------"
check_var "NEXT_PUBLIC_APP_URL" "required"
check_var "ALLOWED_ORIGIN_1" "required"
check_var "ALLOWED_ORIGIN_2" "optional"
echo ""

echo "Checking Rate Limiting (Redis):"
echo "------------------------------"
check_var "REDIS_URL" "optional"
check_var "REDIS_PASSWORD" "optional"
echo ""

echo "Checking API Keys:"
echo "-----------------"
check_var "ANTHROPIC_API_KEY" "optional"
check_var "NEXT_PUBLIC_UNSPLASH_ACCESS_KEY" "optional"
echo ""

# Check NODE_ENV
NODE_ENV=$(grep "^NODE_ENV=" .env.local | cut -d '=' -f2)
echo "Environment Check:"
echo "-----------------"
if [ "$NODE_ENV" = "production" ]; then
    echo -e "${GREEN}✅ NODE_ENV: production${NC}"
elif [ "$NODE_ENV" = "development" ]; then
    echo -e "${YELLOW}⚠️  NODE_ENV: development (change to 'production' for deployment)${NC}"
else
    echo -e "${RED}❌ NODE_ENV: $NODE_ENV (should be 'production' or 'development')${NC}"
fi
echo ""

# Check DATABASE_URL format
DATABASE_URL=$(grep "^DATABASE_URL=" .env.local | cut -d '=' -f2-)
if [[ $DATABASE_URL == postgresql://* ]] || [[ $DATABASE_URL == postgres://* ]]; then
    echo -e "${GREEN}✅ DATABASE_URL format: Valid PostgreSQL connection string${NC}"

    # Check for SSL in production
    if [[ $DATABASE_URL == *"sslmode=require"* ]] || [[ $DATABASE_URL == *"ssl=true"* ]]; then
        echo -e "${GREEN}✅ SSL: Enabled in connection string${NC}"
    else
        echo -e "${YELLOW}⚠️  SSL: Not found in connection string (recommended for production)${NC}"
        echo "   Consider adding ?sslmode=require to your DATABASE_URL"
    fi
else
    echo -e "${RED}❌ DATABASE_URL format: Invalid or missing${NC}"
fi
echo ""

# Summary
echo "========================================"
echo "📊 Configuration Summary"
echo "========================================"
echo ""

# Count issues
ERRORS=0
WARNINGS=0

# Recheck and count
grep "^JWT_SECRET=" .env.local > /dev/null || ((ERRORS++))
grep "^DATABASE_URL=" .env.local > /dev/null || ((ERRORS++))
grep "^ADMIN_PASSWORD=" .env.local > /dev/null || ((ERRORS++))

if [ "$NODE_ENV" != "production" ] && [ "$NODE_ENV" != "development" ]; then
    ((ERRORS++))
fi

if [ $ERRORS -gt 0 ]; then
    echo -e "${RED}❌ Critical Issues Found: $ERRORS${NC}"
    echo "   Please fix the errors above before deploying"
    exit 1
elif [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Warnings: $WARNINGS${NC}"
    echo "   Configuration is functional but could be improved"
    exit 0
else
    echo -e "${GREEN}✅ All checks passed!${NC}"
    echo "   Your configuration is ready for deployment"
    exit 0
fi
