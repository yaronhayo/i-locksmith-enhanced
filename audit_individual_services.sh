#!/bin/bash

echo "INDIVIDUAL SERVICE PAGES REVIEW COUNT AUDIT:"
echo "=============================================="

total_reviews=0
compliant_pages=0
non_compliant_pages=0

individual_services=(
    "access-control"
    "business-lockout"
    "car-key-cutting"
    "car-key-duplicate"
    "car-key-replacement"
    "car-lockout"
    "commercial-lock-rekey"
    "commercial-lock-replacement"
    "emergency-exit-devices"
    "emergency-locksmith"
    "gate-locks"
    "house-lockout"
    "ignition-lock-cylinder"
    "key-fob-programming"
    "lock-rekey"
    "lock-repair"
    "lock-replacement"
    "master-key-systems"
    "storage-unit-lockout"
)

for service in "${individual_services[@]}"; do
    count=$(grep -o ">[A-Z][A-Z]</div>" "services/${service}.html" | wc -l | tr -d ' ')
    total_reviews=$((total_reviews + count))

    if [ "$count" -eq 12 ]; then
        echo "$service: $count reviews (✓ Compliant)"
        compliant_pages=$((compliant_pages + 1))
    else
        echo "$service: $count reviews (✗ Missing $((12 - count)))"
        non_compliant_pages=$((non_compliant_pages + 1))
    fi
done

echo "=============================================="
echo "Total pages: ${#individual_services[@]}"
echo "Compliant pages: $compliant_pages"
echo "Non-compliant pages: $non_compliant_pages"
echo "Total reviews found: $total_reviews"
echo "Expected reviews: $((${#individual_services[@]} * 12))"
echo "Missing reviews: $(( (${#individual_services[@]} * 12) - total_reviews))"