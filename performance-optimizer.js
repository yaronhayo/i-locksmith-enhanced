// Performance Optimizer for I Locksmith Website
// Handles lazy loading, resource optimization, and user experience improvements

class PerformanceOptimizer {
    constructor() {
        this.observerOptions = {
            root: null,
            rootMargin: '50px',
            threshold: 0.1
        };

        this.imageObserver = null;
        this.videoObserver = null;
        this.isInitialized = false;

        console.log('⚡ Performance Optimizer initialized');
    }

    // Initialize all optimizations
    initialize() {
        if (this.isInitialized) {
            return;
        }

        try {
            this.optimizeCriticalResources();
            this.setupLazyLoading();
            this.optimizeImages();
            this.optimizeVideoLoading();
            this.preloadCriticalResources();
            this.setupResourceHints();
            this.optimizeFormPerformance();
            this.handleSlowConnections();

            this.isInitialized = true;
            console.log('✅ Performance optimization complete');

        } catch (error) {
            console.error('❌ Performance optimization failed:', error);
        }
    }

    // Optimize critical resources
    optimizeCriticalResources() {
        // Preload hero background image
        const heroImage = document.querySelector('.hero-bg, [style*="background-image"]');
        if (heroImage) {
            const bgImage = this.extractBackgroundImageUrl(heroImage);
            if (bgImage) {
                this.preloadResource(bgImage, 'image');
            }
        }

        // Preload logo
        const logo = document.querySelector('img[src*="logo"], img[alt*="logo" i]');
        if (logo && logo.src) {
            this.preloadResource(logo.src, 'image');
        }

        console.log('🔧 Critical resources optimized');
    }

    // Setup lazy loading for images and videos
    setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            this.imageObserver = new IntersectionObserver(
                this.handleImageIntersection.bind(this),
                this.observerOptions
            );

            this.videoObserver = new IntersectionObserver(
                this.handleVideoIntersection.bind(this),
                this.observerOptions
            );

            // Observe lazy images
            const lazyImages = document.querySelectorAll('img[data-src], img[loading="lazy"]');
            lazyImages.forEach(img => this.imageObserver.observe(img));

            // Observe lazy videos
            const lazyVideos = document.querySelectorAll('video[data-src]');
            lazyVideos.forEach(video => this.videoObserver.observe(video));

            console.log(`🖼️ Lazy loading setup: ${lazyImages.length} images, ${lazyVideos.length} videos`);
        } else {
            // Fallback for older browsers
            this.loadAllImagesImmediately();
        }
    }

    // Handle image intersection for lazy loading
    handleImageIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;

                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }

                if (img.dataset.srcset) {
                    img.srcset = img.dataset.srcset;
                    img.removeAttribute('data-srcset');
                }

                img.classList.remove('lazy-loading');
                img.classList.add('lazy-loaded');

                this.imageObserver.unobserve(img);
            }
        });
    }

    // Handle video intersection for lazy loading
    handleVideoIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const video = entry.target;

                if (video.dataset.src) {
                    video.src = video.dataset.src;
                    video.removeAttribute('data-src');
                    video.load();
                }

                this.videoObserver.unobserve(video);
            }
        });
    }

    // Optimize existing images
    optimizeImages() {
        const images = document.querySelectorAll('img');

        images.forEach(img => {
            // Add proper loading attributes
            if (!img.hasAttribute('loading')) {
                // Mark above-the-fold images as eager, others as lazy
                const rect = img.getBoundingClientRect();
                const isAboveFold = rect.top < window.innerHeight;
                img.loading = isAboveFold ? 'eager' : 'lazy';
            }

            // Add error handling
            img.addEventListener('error', () => {
                console.warn('🖼️ Image failed to load:', img.src);
                img.style.display = 'none';
            });

            // Add load success tracking
            img.addEventListener('load', () => {
                img.classList.add('loaded');
            });
        });

        console.log(`🖼️ Optimized ${images.length} images`);
    }

    // Optimize video loading
    optimizeVideoLoading() {
        const videos = document.querySelectorAll('video');

        videos.forEach(video => {
            // Add proper preload attributes
            if (!video.hasAttribute('preload')) {
                video.preload = 'metadata'; // Load metadata only
            }

            // Pause videos that are not in view
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        if (video.paused && video.autoplay) {
                            video.play().catch(e => console.warn('Video autoplay failed:', e));
                        }
                    } else {
                        if (!video.paused && video.autoplay) {
                            video.pause();
                        }
                    }
                });
            }, { threshold: 0.5 });

            observer.observe(video);
        });

        console.log(`📹 Optimized ${videos.length} videos`);
    }

    // Preload critical resources
    preloadCriticalResources() {
        const criticalResources = [
            { href: './script.js', as: 'script' },
            { href: './validation.js', as: 'script' },
            { href: './optimized-fonts.css', as: 'style' }
        ];

        criticalResources.forEach(resource => {
            if (document.querySelector(`[href="${resource.href}"]`)) {
                return; // Already loaded
            }

            this.preloadResource(resource.href, resource.as);
        });
    }

    // Setup resource hints
    setupResourceHints() {
        const resourceHints = [
            { rel: 'dns-prefetch', href: 'https://fonts.googleapis.com' },
            { rel: 'dns-prefetch', href: 'https://fonts.gstatic.com' },
            { rel: 'dns-prefetch', href: 'https://maps.googleapis.com' },
            { rel: 'dns-prefetch', href: 'https://www.googletagmanager.com' },
            { rel: 'dns-prefetch', href: 'https://www.google-analytics.com' }
        ];

        resourceHints.forEach(hint => {
            const link = document.createElement('link');
            link.rel = hint.rel;
            link.href = hint.href;
            document.head.appendChild(link);
        });

        console.log('🔗 Resource hints setup complete');
    }

    // Optimize form performance
    optimizeFormPerformance() {
        const forms = document.querySelectorAll('form');

        forms.forEach(form => {
            // Add form validation optimization
            const inputs = form.querySelectorAll('input, textarea, select');

            inputs.forEach(input => {
                // Debounce validation
                let validationTimeout;
                input.addEventListener('input', () => {
                    clearTimeout(validationTimeout);
                    validationTimeout = setTimeout(() => {
                        this.validateField(input);
                    }, 300);
                });
            });

            // Optimize form submission
            form.addEventListener('submit', (event) => {
                this.optimizeFormSubmission(form, event);
            });
        });

        console.log(`📝 Optimized ${forms.length} forms`);
    }

    // Handle slow network connections
    handleSlowConnections() {
        if ('connection' in navigator) {
            const connection = navigator.connection;

            if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
                document.body.classList.add('slow-connection');

                // Disable autoplay videos
                const videos = document.querySelectorAll('video[autoplay]');
                videos.forEach(video => {
                    video.removeAttribute('autoplay');
                    video.preload = 'none';
                });

                // Reduce image quality
                this.optimizeForSlowConnection();

                console.log('🐌 Slow connection detected, optimizations applied');
            }
        }
    }

    // Optimize for slow connections
    optimizeForSlowConnection() {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            // Reduce image sizes for slow connections
            if (img.srcset) {
                const sizes = img.srcset.split(',');
                img.src = sizes[0].split(' ')[0]; // Use smallest image
            }
        });
    }

    // Validate form fields
    validateField(input) {
        // Basic validation - extend as needed
        if (input.hasAttribute('required') && !input.value.trim()) {
            input.classList.add('error');
            return false;
        }

        input.classList.remove('error');
        return true;
    }

    // Optimize form submission
    optimizeFormSubmission(form, event) {
        const submitButton = form.querySelector('[type="submit"]');

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'Sending...';

            // Re-enable after timeout as fallback
            setTimeout(() => {
                submitButton.disabled = false;
                submitButton.textContent = submitButton.dataset.originalText || 'Submit';
            }, 10000);
        }
    }

    // Preload a resource
    preloadResource(href, as) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = href;
        link.as = as;

        if (as === 'font') {
            link.crossOrigin = 'anonymous';
        }

        document.head.appendChild(link);
    }

    // Extract background image URL
    extractBackgroundImageUrl(element) {
        const style = window.getComputedStyle(element);
        const bgImage = style.backgroundImage;

        if (bgImage && bgImage !== 'none') {
            const match = bgImage.match(/url\("?(.+?)"?\)/);
            return match ? match[1] : null;
        }

        return null;
    }

    // Load all images immediately (fallback)
    loadAllImagesImmediately() {
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        });
    }

    // Get performance metrics
    getPerformanceMetrics() {
        if ('performance' in window) {
            const navigation = performance.getEntriesByType('navigation')[0];
            const paint = performance.getEntriesByType('paint');

            return {
                loadTime: navigation.loadEventEnd - navigation.loadEventStart,
                domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                firstPaint: paint.find(p => p.name === 'first-paint')?.startTime,
                firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime
            };
        }
        return null;
    }
}

// Initialize performance optimizer when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.performanceOptimizer = new PerformanceOptimizer();
    window.performanceOptimizer.initialize();
});

// Report performance metrics when page is fully loaded
window.addEventListener('load', () => {
    setTimeout(() => {
        if (window.performanceOptimizer && window.optimizedAnalytics) {
            const metrics = window.performanceOptimizer.getPerformanceMetrics();
            if (metrics) {
                window.optimizedAnalytics.trackEvent('performance_metrics', {
                    load_time: Math.round(metrics.loadTime),
                    dom_content_loaded: Math.round(metrics.domContentLoaded),
                    first_paint: Math.round(metrics.firstPaint || 0),
                    first_contentful_paint: Math.round(metrics.firstContentfulPaint || 0)
                });
            }
        }
    }, 1000);
});

// Export for manual usage
window.PerformanceOptimizer = PerformanceOptimizer;