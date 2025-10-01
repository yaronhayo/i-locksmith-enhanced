#!/usr/bin/env python3

import json
from collections import defaultdict, Counter
import difflib

def load_review_data():
    """Load the extracted review data"""
    with open('/Users/yaronhayo/Desktop/I Locksmith 2025/i-locksmith/review_audit_data.json', 'r') as f:
        return json.load(f)

def check_duplicate_names(data):
    """Check for duplicate customer names across pages"""
    name_to_pages = defaultdict(list)

    for page_path, page_data in data.items():
        for review in page_data['reviews']:
            if 'customer_name' in review:
                name_to_pages[review['customer_name']].append(page_path)

    duplicates = {name: pages for name, pages in name_to_pages.items() if len(pages) > 1}
    return duplicates

def check_similar_reviews(data):
    """Check for very similar review text across pages"""
    all_reviews = []

    for page_path, page_data in data.items():
        for review in page_data['reviews']:
            if 'review_text' in review:
                all_reviews.append({
                    'text': review['review_text'],
                    'page': page_path,
                    'customer': review.get('customer_name', 'Unknown')
                })

    similar_pairs = []
    for i, review1 in enumerate(all_reviews):
        for j, review2 in enumerate(all_reviews[i+1:], i+1):
            similarity = difflib.SequenceMatcher(None, review1['text'], review2['text']).ratio()
            if similarity > 0.8:  # 80% similarity threshold
                similar_pairs.append({
                    'similarity': similarity,
                    'review1': review1,
                    'review2': review2
                })

    return similar_pairs

def analyze_service_tags_by_category(data):
    """Analyze service tags by page category"""
    tag_analysis = {}

    for page_path, page_data in data.items():
        category = page_data['category']
        tags = []

        for review in page_data['reviews']:
            if 'service_tag' in review:
                tags.append(review['service_tag'])

        tag_analysis[page_path] = {
            'category': category,
            'tags': tags,
            'unique_tags': list(set(tags)),
            'tag_counts': Counter(tags)
        }

    return tag_analysis

def categorize_service_tags():
    """Define expected service tags by category"""
    return {
        'residential_services': [
            'Lock Rekey', 'Lock Replacement', 'House Lockout', 'Key Cutting',
            'Emergency Locksmith', 'Lock Repair', 'Home Security'
        ],
        'commercial_services': [
            'Commercial Lock Rekey', 'Business Lockout', 'Access Control',
            'Master Key Systems', 'Commercial Lock Replacement', 'Emergency Exit Devices'
        ],
        'automotive_services': [
            'Car Lockout', 'Car Key Replacement', 'Key Fob Programming',
            'Car Key Cutting', 'Ignition Lock Cylinder', 'Car Key Duplicate'
        ],
        'general_services': [
            'Emergency Locksmith', 'Lock Repair', 'Key Cutting', 'Storage Unit Lockout'
        ]
    }

def validate_service_tags(tag_analysis, expected_tags):
    """Validate service tags against expected categories"""
    issues = []

    for page_path, analysis in tag_analysis.items():
        category = analysis['category']
        page_tags = set(analysis['unique_tags'])

        # Define expectations for each category
        if category == 'service_area_pages':
            # Service area pages should show diverse services from same city
            expected_diversity = True
            min_different_services = 3

        elif category == 'service_category_pages':
            # Service category pages should show services matching the category
            if 'residential-locksmith' in page_path:
                expected_services = set(expected_tags['residential_services'] + expected_tags['general_services'])
            elif 'auto-locksmith' in page_path:
                expected_services = set(expected_tags['automotive_services'] + expected_tags['general_services'])
            elif 'commercial-locksmith' in page_path:
                expected_services = set(expected_tags['commercial_services'] + expected_tags['general_services'])
            else:
                expected_services = set()

        elif category == 'individual_service_pages':
            # Individual service pages should show only that specific service
            service_name_map = {
                'car-lockout.html': 'Car Lockout',
                'house-lockout.html': 'House Lockout',
                'business-lockout.html': 'Business Lockout',
                'storage-unit-lockout.html': 'Storage Unit Lockout',
                'lock-rekey.html': 'Lock Rekey',
                'lock-replacement.html': 'Lock Replacement',
                'car-key-replacement.html': 'Car Key Replacement'
            }
            expected_single_service = None
            for filename, service in service_name_map.items():
                if filename in page_path:
                    expected_single_service = service
                    break

        elif category == 'main_pages':
            # Main pages should show diverse services
            expected_diversity = True
            min_different_services = 4

        # Check for issues based on category
        if category == 'service_area_pages' or category == 'main_pages':
            if len(analysis['unique_tags']) < 3:
                issues.append({
                    'page': page_path,
                    'issue': f'Insufficient service diversity: only {len(analysis["unique_tags"])} unique services',
                    'tags': analysis['unique_tags']
                })

        elif category == 'service_category_pages':
            unexpected_tags = page_tags - expected_services
            if unexpected_tags:
                issues.append({
                    'page': page_path,
                    'issue': f'Unexpected service tags for category',
                    'unexpected_tags': list(unexpected_tags),
                    'expected_category': 'residential' if 'residential' in page_path else 'auto' if 'auto' in page_path else 'commercial'
                })

        elif category == 'individual_service_pages':
            if expected_single_service:
                non_matching_tags = [tag for tag in page_tags if tag != expected_single_service]
                if non_matching_tags:
                    issues.append({
                        'page': page_path,
                        'issue': f'Mixed service tags on individual service page',
                        'expected_service': expected_single_service,
                        'found_tags': list(page_tags)
                    })

    return issues

def main():
    print("🔍 Analyzing extracted review data...")
    print("=" * 60)

    # Load data
    data = load_review_data()

    # 1. Check for duplicate customer names
    print("\n📊 DUPLICATE CUSTOMER NAMES ANALYSIS")
    print("-" * 40)
    duplicate_names = check_duplicate_names(data)

    if duplicate_names:
        print(f"⚠️  Found {len(duplicate_names)} customers appearing on multiple pages:")
        for name, pages in duplicate_names.items():
            print(f"   • {name}: appears on {len(pages)} pages")
            for page in pages:
                print(f"     - {page}")
    else:
        print("✅ No duplicate customer names found")

    # 2. Check for similar review text
    print("\n📊 SIMILAR REVIEW TEXT ANALYSIS")
    print("-" * 40)
    similar_reviews = check_similar_reviews(data)

    if similar_reviews:
        print(f"⚠️  Found {len(similar_reviews)} pairs of very similar reviews:")
        for pair in similar_reviews[:5]:  # Show first 5
            print(f"   • Similarity: {pair['similarity']:.2%}")
            print(f"     Page 1: {pair['review1']['page']} ({pair['review1']['customer']})")
            print(f"     Page 2: {pair['review2']['page']} ({pair['review2']['customer']})")
            print(f"     Text 1: {pair['review1']['text'][:100]}...")
            print(f"     Text 2: {pair['review2']['text'][:100]}...")
            print()
    else:
        print("✅ No highly similar reviews found")

    # 3. Analyze service tags
    print("\n📊 SERVICE TAG ANALYSIS BY CATEGORY")
    print("-" * 40)
    tag_analysis = analyze_service_tags_by_category(data)
    expected_tags = categorize_service_tags()

    # Show tag distribution by category
    for category in ['service_area_pages', 'service_category_pages', 'individual_service_pages', 'main_pages']:
        category_pages = [path for path, analysis in tag_analysis.items() if analysis['category'] == category]
        if category_pages:
            print(f"\n{category.replace('_', ' ').title()}:")
            all_tags = []
            for page in category_pages:
                all_tags.extend(tag_analysis[page]['tags'])
            tag_counts = Counter(all_tags)
            for tag, count in tag_counts.most_common():
                print(f"   • {tag}: {count} occurrences")

    # 4. Validate service tags
    print("\n📊 SERVICE TAG VALIDATION")
    print("-" * 40)
    tag_issues = validate_service_tags(tag_analysis, expected_tags)

    if tag_issues:
        print(f"⚠️  Found {len(tag_issues)} service tag issues:")
        for issue in tag_issues:
            print(f"   • Page: {issue['page']}")
            print(f"     Issue: {issue['issue']}")
            if 'unexpected_tags' in issue:
                print(f"     Unexpected tags: {issue['unexpected_tags']}")
            if 'found_tags' in issue:
                print(f"     Found tags: {issue['found_tags']}")
            if 'expected_service' in issue:
                print(f"     Expected: {issue['expected_service']}")
            print()
    else:
        print("✅ All service tags appear to be correctly categorized")

    # 5. Summary statistics
    print("\n📊 SUMMARY STATISTICS")
    print("-" * 40)
    total_pages = len(data)
    total_reviews = sum(len(page_data['reviews']) for page_data in data.values())

    print(f"Total pages audited: {total_pages}")
    print(f"Total reviews found: {total_reviews}")
    print(f"Average reviews per page: {total_reviews/total_pages:.1f}")

    pages_by_category = defaultdict(int)
    for page_data in data.values():
        pages_by_category[page_data['category']] += 1

    print(f"\nPages by category:")
    for category, count in pages_by_category.items():
        print(f"   • {category.replace('_', ' ').title()}: {count}")

if __name__ == "__main__":
    main()