#!/usr/bin/env python3

import os
import re
import json
from pathlib import Path
import html
from collections import defaultdict

def extract_reviews_from_html(filepath):
    """Extract all reviews from an HTML file with corrected patterns"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
        return []

    reviews = []

    # Pattern to match complete review cards
    review_pattern = r'<div class="review-card[^>]*>(.*?)</div>\s*</div>\s*</div>'
    matches = re.findall(review_pattern, content, re.DOTALL)

    for match in matches:
        review_data = {}

        # Extract customer name - more specific pattern
        name_pattern = r'<p class="font-bold[^>]*>([^<]+)</p>'
        name_match = re.search(name_pattern, match)
        if name_match:
            review_data['customer_name'] = name_match.group(1).strip()

        # Extract location
        location_pattern = r'<span class="material-icons[^>]*>location_on</span>\s*([^<]+)'
        location_match = re.search(location_pattern, match)
        if location_match:
            review_data['location'] = location_match.group(1).strip()

        # Extract review text - from the quote bubble
        text_pattern = r'<div class="bg-white[^>]*rounded-2xl[^>]*>\s*<p[^>]*>(.*?)</p>'
        text_match = re.search(text_pattern, match, re.DOTALL)
        if text_match:
            # Clean up the text and remove HTML
            text = text_match.group(1).strip()
            text = re.sub(r'\s+', ' ', text)  # Normalize whitespace
            review_data['review_text'] = html.unescape(text)

        # Extract service tag - look for the service tag div after the review
        tag_pattern = r'<div class="service-tag[^>]*>[\s\S]*?<span[^>]*>([^<]+)</span>'
        tag_match = re.search(tag_pattern, match)
        if tag_match:
            review_data['service_tag'] = tag_match.group(1).strip()

        if review_data:  # Only add if we extracted some data
            reviews.append(review_data)

    return reviews

def categorize_pages():
    """Categorize all HTML pages by type"""
    base_path = Path('/Users/yaronhayo/Desktop/I Locksmith 2025/i-locksmith')

    categories = {
        'service_area_pages': [],
        'service_category_pages': [],
        'individual_service_pages': [],
        'main_pages': []
    }

    # Service area pages
    service_area_dir = base_path / 'service-areas'
    if service_area_dir.exists():
        categories['service_area_pages'] = list(service_area_dir.glob('locksmith-*.html'))

    # Main pages
    for main_page in ['index.html', 'about.html', 'services.html', 'service-areas.html']:
        page_path = base_path / main_page
        if page_path.exists():
            categories['main_pages'].append(page_path)

    # Service pages
    services_dir = base_path / 'services'
    if services_dir.exists():
        # Service category pages
        category_pages = ['residential-locksmith.html', 'auto-locksmith.html', 'commercial-locksmith.html']
        for page in category_pages:
            page_path = services_dir / page
            if page_path.exists():
                categories['service_category_pages'].append(page_path)

        # Individual service pages
        individual_pages = [
            'car-lockout.html', 'house-lockout.html', 'business-lockout.html',
            'storage-unit-lockout.html', 'lock-rekey.html', 'lock-replacement.html',
            'car-key-replacement.html'
        ]
        for page in individual_pages:
            page_path = services_dir / page
            if page_path.exists():
                categories['individual_service_pages'].append(page_path)

    return categories

def main():
    print("🔍 Re-running I Locksmith website review audit with fixed patterns...")
    print("=" * 70)

    # Categorize pages
    categories = categorize_pages()

    # Extract reviews from all pages
    all_reviews = {}

    for category_name, pages in categories.items():
        print(f"\n📋 Processing {category_name.replace('_', ' ').title()}:")
        print("-" * 50)

        for page_path in pages:
            reviews = extract_reviews_from_html(page_path)
            relative_path = str(page_path).replace('/Users/yaronhayo/Desktop/I Locksmith 2025/i-locksmith/', '')
            all_reviews[relative_path] = {
                'category': category_name,
                'reviews': reviews
            }

            # Show detailed info for first few pages to verify extraction
            if len(all_reviews) <= 3:
                print(f"  📄 {relative_path}: {len(reviews)} reviews found")
                if reviews:
                    first_review = reviews[0]
                    print(f"    Sample: {first_review.get('customer_name', 'No name')} - {first_review.get('service_tag', 'No tag')}")
                    print(f"    Text: {first_review.get('review_text', 'No text')[:100]}...")
            else:
                print(f"  📄 {relative_path}: {len(reviews)} reviews found")

    # Save raw data for detailed analysis
    with open('/Users/yaronhayo/Desktop/I Locksmith 2025/i-locksmith/review_audit_data_fixed.json', 'w') as f:
        json.dump(all_reviews, f, indent=2, ensure_ascii=False)

    print(f"\n✅ Audit complete! Data saved to review_audit_data_fixed.json")
    print(f"📊 Total pages processed: {len(all_reviews)}")

    # Quick summary
    total_reviews = sum(len(data['reviews']) for data in all_reviews.values())
    print(f"📋 Total reviews found: {total_reviews}")

if __name__ == "__main__":
    main()