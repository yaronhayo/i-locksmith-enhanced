#!/usr/bin/env python3

import os
import re
import json
from pathlib import Path
import html
from collections import defaultdict, Counter
import difflib

def extract_comprehensive_review_data(filepath):
    """Extract reviews and all service tags from an HTML file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
        return [], []

    reviews = []
    service_tags = []

    # Extract all service tags from the page
    tag_pattern = r'<div class="service-tag[^>]*>[\s\S]*?<span[^>]*>([^<]+)</span>[\s\S]*?</div>'
    tag_matches = re.findall(tag_pattern, content)
    service_tags = [tag.strip() for tag in tag_matches]

    # Extract reviews
    review_pattern = r'<div class="review-card[^>]*>(.*?)</div>\s*</div>\s*</div>'
    review_matches = re.findall(review_pattern, content, re.DOTALL)

    for i, match in enumerate(review_matches):
        review_data = {}

        # Extract customer name
        name_pattern = r'<p class="font-bold[^>]*>([^<]+)</p>'
        name_match = re.search(name_pattern, match)
        if name_match:
            review_data['customer_name'] = name_match.group(1).strip()

        # Extract location
        location_pattern = r'<span class="material-icons[^>]*>location_on</span>\s*([^<]+)'
        location_match = re.search(location_pattern, match)
        if location_match:
            review_data['location'] = location_match.group(1).strip()

        # Extract review text
        text_pattern = r'<div class="bg-white[^>]*rounded-2xl[^>]*>\s*<p[^>]*>(.*?)</p>'
        text_match = re.search(text_pattern, match, re.DOTALL)
        if text_match:
            text = text_match.group(1).strip()
            text = re.sub(r'\s+', ' ', text)  # Normalize whitespace
            review_data['review_text'] = html.unescape(text)

        # Associate service tag (if available, use index-based association)
        if i < len(service_tags):
            review_data['service_tag'] = service_tags[i]

        if review_data:
            reviews.append(review_data)

    return reviews, service_tags

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

def analyze_duplicate_names(all_reviews):
    """Check for duplicate customer names across pages"""
    name_to_pages = defaultdict(list)

    for page_path, page_data in all_reviews.items():
        for review in page_data['reviews']:
            if 'customer_name' in review:
                name_to_pages[review['customer_name']].append(page_path)

    return {name: pages for name, pages in name_to_pages.items() if len(pages) > 1}

def analyze_similar_reviews(all_reviews):
    """Check for very similar review text across pages"""
    all_review_texts = []

    for page_path, page_data in all_reviews.items():
        for review in page_data['reviews']:
            if 'review_text' in review:
                all_review_texts.append({
                    'text': review['review_text'],
                    'page': page_path,
                    'customer': review.get('customer_name', 'Unknown')
                })

    similar_pairs = []
    for i, review1 in enumerate(all_review_texts):
        for j, review2 in enumerate(all_review_texts[i+1:], i+1):
            similarity = difflib.SequenceMatcher(None, review1['text'], review2['text']).ratio()
            if similarity > 0.8:  # 80% similarity threshold
                similar_pairs.append({
                    'similarity': similarity,
                    'review1': review1,
                    'review2': review2
                })

    return similar_pairs

def analyze_service_tag_appropriateness(all_reviews):
    """Analyze if service tags are appropriate for each page type"""
    issues = []

    # Define expected service categories
    residential_services = ['Residential', 'Home', 'House Lockout', 'Lock Rekey', 'Lock Replacement', 'Emergency', 'Key Cutting']
    automotive_services = ['Automotive', 'Car', 'Vehicle', 'Car Lockout', 'Car Key Replacement', 'Key Programming', 'Ignition']
    commercial_services = ['Commercial', 'Business', 'Office', 'Business Lockout', 'Access Control', 'Master Key']
    general_services = ['Emergency', 'Lockout', 'Key Cutting', 'Lock Repair']

    for page_path, page_data in all_reviews.items():
        category = page_data['category']
        page_tags = []

        for review in page_data['reviews']:
            if 'service_tag' in review:
                page_tags.append(review['service_tag'])

        unique_tags = list(set(page_tags))

        if category == 'service_area_pages':
            # Service area pages should show diverse services from same city
            if len(unique_tags) < 3:
                issues.append({
                    'page': page_path,
                    'category': category,
                    'issue': f'Insufficient service diversity: only {len(unique_tags)} unique service tags',
                    'tags': unique_tags
                })

        elif category == 'service_category_pages':
            # Service category pages should show services matching the category
            if 'residential-locksmith' in page_path:
                expected = set(residential_services + general_services)
                unexpected = [tag for tag in unique_tags if not any(exp.lower() in tag.lower() for exp in expected)]
            elif 'auto-locksmith' in page_path:
                expected = set(automotive_services + general_services)
                unexpected = [tag for tag in unique_tags if not any(exp.lower() in tag.lower() for exp in expected)]
            elif 'commercial-locksmith' in page_path:
                expected = set(commercial_services + general_services)
                unexpected = [tag for tag in unique_tags if not any(exp.lower() in tag.lower() for exp in expected)]
            else:
                unexpected = []

            if unexpected:
                issues.append({
                    'page': page_path,
                    'category': category,
                    'issue': f'Unexpected service tags for category',
                    'unexpected_tags': unexpected,
                    'all_tags': unique_tags
                })

        elif category == 'individual_service_pages':
            # Individual service pages should be more consistent
            if 'car-lockout' in page_path:
                expected_keywords = ['car', 'vehicle', 'automotive', 'lockout']
            elif 'house-lockout' in page_path:
                expected_keywords = ['house', 'home', 'residential', 'lockout']
            elif 'business-lockout' in page_path:
                expected_keywords = ['business', 'commercial', 'office', 'lockout']
            elif 'lock-rekey' in page_path:
                expected_keywords = ['rekey', 'key']
            elif 'lock-replacement' in page_path:
                expected_keywords = ['replacement', 'lock']
            elif 'car-key-replacement' in page_path:
                expected_keywords = ['car', 'key', 'replacement', 'automotive']
            else:
                expected_keywords = []

            if expected_keywords:
                mismatched_tags = [tag for tag in unique_tags if not any(keyword.lower() in tag.lower() for keyword in expected_keywords)]
                if len(mismatched_tags) > len(unique_tags) * 0.5:  # More than half don't match
                    issues.append({
                        'page': page_path,
                        'category': category,
                        'issue': f'Service tags may not match page focus',
                        'expected_keywords': expected_keywords,
                        'found_tags': unique_tags,
                        'mismatched_tags': mismatched_tags
                    })

        elif category == 'main_pages':
            # Main pages should show diverse services
            if len(unique_tags) < 3:
                issues.append({
                    'page': page_path,
                    'category': category,
                    'issue': f'Insufficient service diversity: only {len(unique_tags)} unique service tags',
                    'tags': unique_tags
                })

    return issues

def main():
    print("🔍 COMPREHENSIVE I LOCKSMITH WEBSITE REVIEW AUDIT")
    print("=" * 70)
    print("Checking: Review Uniqueness | Service Tag Appropriateness | Diversity Logic")
    print("=" * 70)

    # Categorize pages
    categories = categorize_pages()
    all_reviews = {}

    # Extract data from all pages
    for category_name, pages in categories.items():
        print(f"\n📋 Processing {category_name.replace('_', ' ').title()}:")
        print("-" * 50)

        for page_path in pages:
            reviews, service_tags = extract_comprehensive_review_data(page_path)
            relative_path = str(page_path).replace('/Users/yaronhayo/Desktop/I Locksmith 2025/i-locksmith/', '')

            all_reviews[relative_path] = {
                'category': category_name,
                'reviews': reviews,
                'all_service_tags': service_tags
            }

            print(f"  📄 {relative_path}: {len(reviews)} reviews, {len(service_tags)} service tags")

    # ANALYSIS PHASE
    print("\n\n📊 ANALYSIS RESULTS")
    print("=" * 70)

    # 1. Duplicate Customer Names
    print("\n🔍 DUPLICATE CUSTOMER NAMES")
    print("-" * 40)
    duplicate_names = analyze_duplicate_names(all_reviews)
    if duplicate_names:
        print(f"⚠️  CRITICAL ISSUE: Found {len(duplicate_names)} customers appearing on multiple pages:")
        for name, pages in list(duplicate_names.items())[:5]:  # Show first 5
            print(f"   • {name}: {len(pages)} pages")
        print(f"   ... and {max(0, len(duplicate_names) - 5)} more")
    else:
        print("✅ No duplicate customer names found")

    # 2. Similar Review Text
    print("\n🔍 SIMILAR REVIEW TEXT")
    print("-" * 40)
    similar_reviews = analyze_similar_reviews(all_reviews)
    if similar_reviews:
        print(f"⚠️  CRITICAL ISSUE: Found {len(similar_reviews)} pairs of very similar/identical reviews")
        high_similarity = [r for r in similar_reviews if r['similarity'] > 0.95]
        print(f"   • {len(high_similarity)} pairs are >95% similar (likely identical)")
        print(f"   • This suggests systematic copy-paste of reviews across pages")
    else:
        print("✅ No highly similar reviews found")

    # 3. Service Tag Analysis
    print("\n🔍 SERVICE TAG APPROPRIATENESS")
    print("-" * 40)
    tag_issues = analyze_service_tag_appropriateness(all_reviews)
    if tag_issues:
        print(f"⚠️  Found {len(tag_issues)} service tag issues:")
        for issue in tag_issues[:10]:  # Show first 10
            print(f"   • {issue['page']}")
            print(f"     {issue['issue']}")
            if 'tags' in issue:
                print(f"     Tags: {issue['tags']}")
            print()
    else:
        print("✅ All service tags appear appropriately categorized")

    # 4. Service Tag Distribution by Category
    print("\n🔍 SERVICE TAG DISTRIBUTION BY CATEGORY")
    print("-" * 40)
    for category in ['service_area_pages', 'service_category_pages', 'individual_service_pages', 'main_pages']:
        category_tags = []
        category_pages = []

        for page_path, data in all_reviews.items():
            if data['category'] == category:
                category_pages.append(page_path)
                for review in data['reviews']:
                    if 'service_tag' in review:
                        category_tags.append(review['service_tag'])

        if category_tags:
            print(f"\n{category.replace('_', ' ').title()} ({len(category_pages)} pages):")
            tag_counts = Counter(category_tags)
            for tag, count in tag_counts.most_common(10):
                print(f"   • {tag}: {count} occurrences")
        else:
            print(f"\n{category.replace('_', ' ').title()}: No service tags found")

    # 5. Summary Statistics
    print("\n\n📈 SUMMARY STATISTICS")
    print("-" * 40)
    total_pages = len(all_reviews)
    total_reviews = sum(len(data['reviews']) for data in all_reviews.values())
    total_service_tags = sum(len(data['all_service_tags']) for data in all_reviews.values())

    print(f"Total pages audited: {total_pages}")
    print(f"Total reviews found: {total_reviews}")
    print(f"Total service tags: {total_service_tags}")
    print(f"Average reviews per page: {total_reviews/total_pages:.1f}")
    print(f"Average service tags per page: {total_service_tags/total_pages:.1f}")

    # Category breakdown
    pages_by_category = Counter(data['category'] for data in all_reviews.values())
    print(f"\nPages by category:")
    for category, count in pages_by_category.items():
        category_reviews = sum(len(data['reviews']) for data in all_reviews.values() if data['category'] == category)
        print(f"   • {category.replace('_', ' ').title()}: {count} pages ({category_reviews} reviews)")

    # RECOMMENDATIONS
    print("\n\n💡 RECOMMENDATIONS")
    print("-" * 40)

    if duplicate_names:
        print("🚨 HIGH PRIORITY:")
        print("   • Create unique customer names for each page to avoid duplicate appearances")
        print("   • Currently, the same customers appear across all pages, reducing credibility")

    if similar_reviews:
        print("🚨 HIGH PRIORITY:")
        print("   • Write unique review content for each page")
        print("   • Identical reviews across pages look artificial and hurt SEO")

    if tag_issues:
        print("⚠️  MEDIUM PRIORITY:")
        print("   • Ensure service tags match the page context:")
        print("     - Service area pages: Show diverse services from that city")
        print("     - Service category pages: Show only services from that category")
        print("     - Individual service pages: Show only that specific service")

    # Save comprehensive audit data
    with open('/Users/yaronhayo/Desktop/I Locksmith 2025/i-locksmith/comprehensive_audit_results.json', 'w') as f:
        json.dump({
            'all_reviews': all_reviews,
            'duplicate_names': duplicate_names,
            'similar_reviews': len(similar_reviews),
            'tag_issues': tag_issues
        }, f, indent=2, ensure_ascii=False)

    print(f"\n✅ Full audit data saved to comprehensive_audit_results.json")

if __name__ == "__main__":
    main()