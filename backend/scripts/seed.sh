#!/bin/bash
# Naviksha Backend Database Seeding Script
#
# This script seeds the database with initial data:
# - Careers from career_mappings.csv
# - Test questions from JSON files
# - Sample users for testing
# - Admin user (if ADMIN_SECRET is set)
#
# USAGE:
# ./scripts/seed.sh                    # Seed with default settings
# ./scripts/seed.sh --force            # Force reseed (delete existing data)
# ./scripts/seed.sh --admin-only       # Create only admin user
#
# ENVIRONMENT VARIABLES:
# - BACKEND_URL: Backend API URL (default: http://localhost:4000)
# - ADMIN_SECRET: Admin secret for authentication
# - JWT_SECRET: JWT secret for token generation

set -e  # Exit on any error

# Configuration
BACKEND_URL=${BACKEND_URL:-"http://localhost:4000"}
ADMIN_SECRET=${ADMIN_SECRET:-"admin-secret-123"}
FORCE_SEED=false
ADMIN_ONLY=false

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --force)
            FORCE_SEED=true
            shift
            ;;
        --admin-only)
            ADMIN_ONLY=true
            shift
            ;;
        --url)
            BACKEND_URL="$2"
            shift
            shift
            ;;
        --help)
            echo "Usage: $0 [options]"
            echo "Options:"
            echo "  --force       Force reseed (delete existing data)"
            echo "  --admin-only  Create only admin user"
            echo "  --url URL     Backend URL (default: http://localhost:4000)"
            echo "  --help        Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option $1"
            exit 1
            ;;
    esac
done

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if backend is running
check_backend() {
    print_status "Checking if backend is running..."
    
    if curl -f -s "$BACKEND_URL/health" > /dev/null; then
        print_status "Backend is running at $BACKEND_URL"
        return 0
    else
        print_error "Backend is not running at $BACKEND_URL"
        print_error "Please start the backend first: mvn spring-boot:run"
        exit 1
    fi
}

# Function to create admin user and get auth token
get_admin_auth() {
    print_status "Getting admin authentication..."
    
    if [ -z "$ADMIN_SECRET" ]; then
        print_error "ADMIN_SECRET environment variable not set"
        exit 1
    fi
    
    # Try to call admin endpoint with secret
    RESPONSE=$(curl -s -w "%{http_code}" \
        -H "X-Admin-Secret: $ADMIN_SECRET" \
        -H "Content-Type: application/json" \
        "$BACKEND_URL/admin/stats" \
        -o /tmp/admin_response.json)
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -c 4)
    
    if [ "$HTTP_CODE" -eq 200 ]; then
        print_status "Admin authentication successful"
        ADMIN_AUTH_HEADER="X-Admin-Secret: $ADMIN_SECRET"
    else
        print_error "Admin authentication failed (HTTP $HTTP_CODE)"
        print_error "Response: $(cat /tmp/admin_response.json 2>/dev/null || echo 'No response body')"
        exit 1
    fi
}

# Function to call admin seed endpoint
call_seed_endpoint() {
    print_status "Calling database seed endpoint..."
    
    CURL_ARGS="-s -w %{http_code} -H Content-Type: application/json"
    
    if [ ! -z "$ADMIN_AUTH_HEADER" ]; then
        CURL_ARGS="$CURL_ARGS -H \"$ADMIN_AUTH_HEADER\""
    fi
    
    RESPONSE=$(eval curl $CURL_ARGS \
        -X POST \
        "$BACKEND_URL/admin/seed" \
        -o /tmp/seed_response.json)
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -c 4)
    
    if [ "$HTTP_CODE" -eq 200 ]; then
        print_status "Database seeding completed successfully!"
        
        # Display seed results
        if [ -f /tmp/seed_response.json ]; then
            echo ""
            print_status "Seed Results:"
            cat /tmp/seed_response.json | python3 -m json.tool 2>/dev/null || cat /tmp/seed_response.json
            echo ""
        fi
    else
        print_error "Database seeding failed (HTTP $HTTP_CODE)"
        print_error "Response: $(cat /tmp/seed_response.json 2>/dev/null || echo 'No response body')"
        exit 1
    fi
}

# Function to verify seeded data
verify_seed() {
    print_status "Verifying seeded data..."
    
    # Check careers count
    CAREERS_RESPONSE=$(curl -s "$BACKEND_URL/api/tests" || echo "[]")
    CAREERS_COUNT=$(echo "$CAREERS_RESPONSE" | python3 -c "import sys, json; print(len(json.load(sys.stdin)))" 2>/dev/null || echo "0")
    
    if [ "$CAREERS_COUNT" -gt 0 ]; then
        print_status "✓ Found $CAREERS_COUNT test(s) in database"
    else
        print_warning "⚠ No tests found in database"
    fi
    
    # Check if demo report is available
    DEMO_RESPONSE=$(curl -s -w "%{http_code}" "$BACKEND_URL/api/reports/demo/aisha" -o /tmp/demo_response.json)
    DEMO_HTTP_CODE=$(echo "$DEMO_RESPONSE" | tail -c 4)
    
    if [ "$DEMO_HTTP_CODE" -eq 200 ]; then
        print_status "✓ Demo report endpoint working"
    else
        print_warning "⚠ Demo report endpoint not working (HTTP $DEMO_HTTP_CODE)"
    fi
}

# Function to display next steps
show_next_steps() {
    echo ""
    print_status "🎉 Database seeding completed!"
    echo ""
    echo "Next steps:"
    echo "1. Test the API endpoints:"
    echo "   curl $BACKEND_URL/api/tests"
    echo "   curl $BACKEND_URL/api/reports/demo/aisha"
    echo ""
    echo "2. Access admin panel:"
    echo "   curl -H \"X-Admin-Secret: $ADMIN_SECRET\" $BACKEND_URL/admin/careers"
    echo ""
    echo "3. View API documentation:"
    echo "   Open: $BACKEND_URL/swagger-ui.html"
    echo ""
    echo "4. Test user registration:"
    echo "   curl -X POST $BACKEND_URL/api/auth/register \\"
    echo "        -H \"Content-Type: application/json\" \\"
    echo "        -d '{\"email\":\"test@example.com\",\"password\":\"test123\",\"name\":\"Test User\"}'"
    echo ""
}

# Main execution
main() {
    echo "🚀 Naviksha Backend Database Seeding"
    echo "====================================="
    echo ""
    
    if [ "$ADMIN_ONLY" = true ]; then
        print_status "Running in admin-only mode"
    elif [ "$FORCE_SEED" = true ]; then
        print_warning "Force mode enabled - existing data will be replaced"
    fi
    
    # Step 1: Check backend
    check_backend
    
    # Step 2: Get admin authentication
    get_admin_auth
    
    # Step 3: Call seed endpoint
    if [ "$ADMIN_ONLY" = false ]; then
        call_seed_endpoint
        
        # Step 4: Verify seeded data
        verify_seed
        
        # Step 5: Show next steps
        show_next_steps
    else
        print_status "Admin user setup completed (admin-only mode)"
    fi
    
    # Cleanup
    rm -f /tmp/admin_response.json /tmp/seed_response.json /tmp/demo_response.json
}

# Run main function
main "$@"