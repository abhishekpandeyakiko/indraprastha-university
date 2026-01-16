/**
 * Home Page Logic
 * Handles interactions specific to the home page (Slider, etc.)
 */

const HomeLogic = {
    heroInterval: null, // Track interval to prevent leaks

    /**
     * Initializes the Hero Slider (Auto-play & Controls)
     */
    initHeroSlider: function () {
        // Clear any existing interval first to prevent leaks
        this.cleanup();

        const slides = document.querySelectorAll('.hero-slide');
        const prevBtn = document.querySelector('.slider-nav.prev');
        const nextBtn = document.querySelector('.slider-nav.next');

        if (!slides.length) return;

        let currentSlide = 0;
        const totalSlides = slides.length;

        // Function to show a specific slide
        const showSlide = (index) => {
            slides.forEach(slide => slide.classList.remove('active'));

            // Handle wrapping
            if (index >= totalSlides) currentSlide = 0;
            else if (index < 0) currentSlide = totalSlides - 1;
            else currentSlide = index;

            slides[currentSlide].classList.add('active');
        };

        // Next Slide
        const nextSlide = () => {
            showSlide(currentSlide + 1);
        };

        // Prev Slide
        const prevSlide = () => {
            showSlide(currentSlide - 1);
        };

        // Event Listeners
        if (nextBtn) {
            nextBtn.onclick = () => {
                nextSlide();
                this.resetTimer(nextSlide);
            };
        }

        if (prevBtn) {
            prevBtn.onclick = () => {
                prevSlide();
                this.resetTimer(nextSlide);
            };
        }

        // Auto Play
        this.heroInterval = setInterval(nextSlide, 3500); // 3.5s interval

        // Initialize Announcement Ticker as well
        this.initAnnouncementTicker();

        // Initialize Floating Modal
        this.initFloatingAnno();

        // Initialize Notice Board
        this.initNoticeBoard();

        // Initialize Video Modal
        this.initVideoModal();

        // Initialize Blog Carousel
        this.initBlogCarousel();

        // Initialize Feedback Carousel
        this.initFeedbackCarousel();

        // Initialize Quick Info Auto Scroll
        this.initQuickInfoScroller();
    },

    /**
     * Initialize Blog Carousel (Stepper + Auto)
     */
    initBlogCarousel: function () {
        const track = document.getElementById('blogTrack');
        const nextBtn = document.getElementById('blogNext');
        const prevBtn = document.getElementById('blogPrev');

        if (!track || !nextBtn || !prevBtn) return;

        // Configuration
        const cardWidth = 380; // Card width from CSS
        const gap = 30;        // Gap from CSS
        const slideDistance = cardWidth + gap;
        const totalItems = track.children.length;

        // State
        let currentIndex = 0;
        let autoPlayInterval;

        // Auto Play Function
        const startAutoPlay = () => {
            stopAutoPlay();
            autoPlayInterval = setInterval(() => {
                moveSlide('next');
            }, 3000); // 3 Seconds
        };

        const stopAutoPlay = () => {
            clearInterval(autoPlayInterval);
        };

        // Move Slide Function
        const moveSlide = (direction) => {
            const maxIndex = totalItems - 3; // Show 3 items at once usually (adjust based on screen)

            // Simple seamless loop logic (rewind/forward)
            // Ideally should clone, but strict rewinding is acceptable for this request "slide hota rahe"
            if (direction === 'next') {
                currentIndex++;
                if (currentIndex > maxIndex) currentIndex = 0; // Loop back to start
            } else {
                currentIndex--;
                if (currentIndex < 0) currentIndex = maxIndex; // Loop to end
            }

            const translateX = -(currentIndex * slideDistance);
            track.style.transform = `translateX(${translateX}px)`;
        };

        // Event Listeners
        nextBtn.addEventListener('click', () => {
            moveSlide('next');
            startAutoPlay(); // Reset timer
        });

        prevBtn.addEventListener('click', () => {
            moveSlide('prev');
            startAutoPlay(); // Reset timer
        });

        // Pause on Hover
        track.addEventListener('mouseenter', stopAutoPlay);
        track.addEventListener('mouseleave', startAutoPlay);

        // Start
        startAutoPlay();
    },

    /**
     * Initialize Feedback Carousel (Click + Auto)
     */
    initFeedbackCarousel: function () {
        const track = document.getElementById('feedbackTrack');
        const nextBtn = document.getElementById('fbNext');
        const prevBtn = document.getElementById('fbPrev');
        const dots = document.querySelectorAll('.feedback-dots .dot');

        if (!track || !nextBtn || !prevBtn) return;

        // Configuration
        const cardWidth = 320; // Match CSS
        const gap = 15;        // Match CSS (15px)
        const slideDistance = cardWidth + gap;
        let currentIndex = 0;
        let autoPlayInterval;

        // Update Active Dot
        const updateDots = (index) => {
            if (!dots.length) return;
            dots.forEach(dot => dot.classList.remove('active'));
            // Safety check if index exceeds dots count (though 1:1 expected)
            if (dots[index]) {
                dots[index].classList.add('active');
            } else if (dots.length > 0) {
                // Fallback for bounds
                dots[dots.length - 1].classList.add('active');
            }
        };

        // Go to specific slide
        const goToSlide = (index) => {
            const containerWidth = document.querySelector('.feedback-carousel-wrapper').offsetWidth;
            const visibleItems = Math.floor(containerWidth / cardWidth);
            const safeVisible = visibleItems > 0 ? visibleItems : 1;

            // Allow going up to the last item, even if it creates whitespace? 
            // Standard assumption: user wants to see that card. 
            // However, limiting to maxIndex prevents ugly whitespace.
            // But we have 4 dots for 4 cards. If we limit, dot 3 & 4 might set index to maxIndex (e.g. 1).
            // Let's use the requested index but clamp for safety if needed.
            // For now, I will trust the index to map 1:1 to allow full control.

            currentIndex = index;
            const translateX = -(currentIndex * slideDistance);
            track.style.transform = `translateX(${translateX}px)`;
            updateDots(currentIndex);
        };

        // Auto Play
        const startAutoPlay = () => {
            stopAutoPlay();
            autoPlayInterval = setInterval(() => {
                moveSlide('next');
            }, 3000); // 3 Seconds
        };

        const stopAutoPlay = () => {
            clearInterval(autoPlayInterval);
        };

        // Move Slide
        const moveSlide = (direction) => {
            const containerWidth = document.querySelector('.feedback-carousel-wrapper').offsetWidth;
            const visibleItems = Math.floor(containerWidth / cardWidth);
            const safeVisible = visibleItems > 0 ? visibleItems : 1;
            const maxIndex = Math.max(0, track.children.length - safeVisible);

            // Note: maxIndex logic restricts "next" loop, but dots allow jumping anywhere.
            // If we are at index 0 and maxIndex is 1. Next -> 1. Next -> 0.

            let newIndex = currentIndex;

            if (direction === 'next') {
                if (currentIndex < maxIndex) {
                    newIndex++;
                } else {
                    newIndex = 0; // Loop to start
                }
            } else {
                if (currentIndex > 0) {
                    newIndex--;
                } else {
                    newIndex = maxIndex; // Loop to end
                }
            }
            goToSlide(newIndex);
        };

        // Listeners
        nextBtn.addEventListener('click', () => {
            moveSlide('next');
            startAutoPlay(); // Reset timer
        });

        prevBtn.addEventListener('click', () => {
            moveSlide('prev');
            startAutoPlay(); // Reset timer
        });

        // Dot Listeners
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                goToSlide(index);
                startAutoPlay();
            });
        });

        // Pause on Hover
        track.addEventListener('mouseenter', stopAutoPlay);
        track.addEventListener('mouseleave', startAutoPlay);

        // Start
        updateDots(0);
        startAutoPlay();
    },

    /**
     * Initialize Auto Scroll for Quick Info Lists
     */
    initQuickInfoScroller: function () {
        const lists = document.querySelectorAll('.quick-list');

        lists.forEach(list => {
            // Check if content overflows
            if (list.scrollHeight <= list.clientHeight) return;

            // Clone content for seamless scrolling
            const content = list.innerHTML;
            list.innerHTML = content + content; // Duplicate content

            let scrollPos = 0;
            let speed = 0.5; // Adjust speed (pixels per frame)
            let isPaused = false;
            let animationFrameId;

            // Scroll Function
            const matchScroll = () => {
                if (!isPaused) {
                    scrollPos += speed;

                    // Reset when first half is fully scrolled
                    // Note: Since we duplicated, scrollHeight is approx 2x original.
                    // When scrollTop reaches half, we reset to 0.
                    if (scrollPos >= (list.scrollHeight / 2)) {
                        scrollPos = 0;
                    }

                    list.scrollTop = scrollPos;
                }
                animationFrameId = requestAnimationFrame(matchScroll);
            };

            // Start Scroll
            matchScroll();

            // Pause on Hover
            list.addEventListener('mouseenter', () => {
                isPaused = true;
            });

            list.addEventListener('mouseleave', () => {
                isPaused = false;
            });

            // Allow manual touch scroll override on mobile?
            // Complex with auto-scroll. For now, pause on touch.
            list.addEventListener('touchstart', () => isPaused = true);
            list.addEventListener('touchend', () => setTimeout(() => isPaused = false, 1000));
        });
    },

    /**
     * Initialize Video Modal for Events
     */
    initVideoModal: function () {
        const playBtn = document.getElementById('eventPlayBtn');
        const modal = document.getElementById('videoModal');
        const closeBtn = document.getElementById('videoModalClose');
        const videoPlayer = document.getElementById('eventVideoPlayer');
        const captionText = document.getElementById('videoCaptionText');

        if (playBtn && modal && videoPlayer) {
            playBtn.addEventListener('click', () => {
                const videoSrc = playBtn.getAttribute('data-video-src');
                const caption = playBtn.getAttribute('data-caption');

                if (videoSrc) {
                    videoPlayer.src = videoSrc;
                    captionText.textContent = caption || '';
                    modal.classList.add('active');
                    videoPlayer.play().catch(e => console.log('Auto-play prevented:', e));
                }
            });

            const closeModal = () => {
                modal.classList.remove('active');
                videoPlayer.pause();
                videoPlayer.src = ""; // Stop buffering
            };

            if (closeBtn) closeBtn.addEventListener('click', closeModal);

            // Close on outside click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeModal();
            });

            // Close on Escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && modal.classList.contains('active')) {
                    closeModal();
                }
            });
        }
    },

    /**
     * Initialize Notice Board (Scroll & Toggle)
     */
    initNoticeBoard: function () {
        const noticeList = document.querySelector('.notice-list');
        const playBtn = document.getElementById('noticeControlBtn');
        const icon = document.getElementById('noticeIcon');

        if (noticeList) {
            // Clone items for seamless loop if not already cloned (simple check)
            if (!noticeList.getAttribute('data-cloned')) {
                const listItems = noticeList.innerHTML;
                noticeList.innerHTML = listItems + listItems;
                noticeList.setAttribute('data-cloned', 'true');
            }
        }

        if (playBtn && noticeList && icon) {
            // Remove old onclick attribute to avoid dual triggers if any
            playBtn.removeAttribute('onclick');

            // Clean up old listeners (clone node trick or just re-assign)
            const newBtn = playBtn.cloneNode(true);
            playBtn.parentNode.replaceChild(newBtn, playBtn);

            newBtn.addEventListener('click', () => {
                if (noticeList.classList.contains('paused')) {
                    noticeList.classList.remove('paused');
                    icon.classList.remove('fa-play');
                    icon.classList.add('fa-pause');
                } else {
                    noticeList.classList.add('paused');
                    icon.classList.remove('fa-pause');
                    icon.classList.add('fa-play');
                }
            });
        }
    },

    /**
     * Floating Announcement Modal Logic
     */
    initFloatingAnno: function () {
        const modal = document.getElementById('floatingModal');
        const btn = document.getElementById('floatingBtn');
        const closeBtn = document.getElementById('modalClose');

        if (!modal || !btn) return;

        // Auto Open after 2 seconds
        setTimeout(() => {
            modal.classList.add('active');
        }, 2000);

        // Toggle on button click
        btn.addEventListener('click', () => {
            modal.classList.toggle('active');
        });

        // Close on X click
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.classList.remove('active');
            });
        }

        // Start Countdown
        this.startCountdown();
    },

    startCountdown: function () {
        // Target Date: Jan 15, 2026 (Per user image)
        const targetDate = new Date("Jan 15, 2026 00:00:00").getTime();

        const updateTimer = () => {
            const now = new Date().getTime();
            const distance = targetDate - now;

            if (distance < 0) {
                // Expired
                return;
            }

            // Calculations
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            // Update DOM
            const elDays = document.getElementById('cd-days');
            const elHours = document.getElementById('cd-hours');
            const elMin = document.getElementById('cd-min');
            const elSec = document.getElementById('cd-sec');

            if (elDays) elDays.innerText = String(days).padStart(2, '0');
            if (elHours) elHours.innerText = String(hours).padStart(2, '0');
            if (elMin) elMin.innerText = String(minutes).padStart(2, '0');
            if (elSec) elSec.innerText = String(seconds).padStart(2, '0');
        };

        setInterval(updateTimer, 1000);
        updateTimer(); // Run once immediately
    },

    /**
     * Switch Tabs in About Section
     * @param {string} tabId - 'mission', 'vision', or 'values'
     */
    switchTab: function (tabId) {
        // Remove active class from all buttons
        const buttons = document.querySelectorAll('.tab-btn');
        buttons.forEach(btn => btn.classList.remove('active'));

        // Remove active class from all content
        const contents = document.querySelectorAll('.tab-content');
        contents.forEach(content => content.classList.remove('active'));

        // Add active to clicked button (Need to find it, or use event.target if passed, but here we can just find by text or index. 
        // Simpler: find the button that calls this? Or just match index. 
        // Actually, let's select based on the onclick attribute or just add IDs to buttons. 
        // Re-approach: Loop and check text content or just select by order?
        // Let's assume the buttons distinct enough. 
        // Better: Select the button that triggered this. But wait, I put onclick in HTML.
        // Let's find the button by the argument matching? No.
        // Let's just allow the button itself to toggle if we passed `this`.
        // FIX: I will use `event.currentTarget` in safe way or just finding by child index.

        // Let's use a mapping for simplicity if needed, OR:
        // Add logic to highlight the button that was clicked.
        // Since I can't easily pass `this` in the inline string without `call`, I will select based on index.
        // Mission=0, Vision=1, Values=2.

        let index = 0;
        if (tabId === 'vision') index = 1;
        if (tabId === 'values') index = 2;

        if (buttons[index]) buttons[index].classList.add('active');

        // Show Content
        const activeContent = document.getElementById('tab-' + tabId);
        if (activeContent) activeContent.classList.add('active');
    },

    /**
     * Initializes the Announcement Ticker (Pause/Play)
     */
    initAnnouncementTicker: function () {
        const pauseBtn = document.getElementById('annoPauseBtn');
        const marquee = document.getElementById('annoMarquee');

        if (pauseBtn && marquee) {
            pauseBtn.addEventListener('click', () => {
                const isPaused = marquee.classList.toggle('paused');
                const icon = pauseBtn.querySelector('i');

                // Toggle Icon
                if (isPaused) {
                    icon.classList.remove('fa-pause');
                    icon.classList.add('fa-play');
                } else {
                    icon.classList.remove('fa-play');
                    icon.classList.add('fa-pause');
                }
            });
        }
    },

    /**
     * Resets the auto-play timer
     */
    resetTimer: function (callback) {
        if (this.heroInterval) clearInterval(this.heroInterval);
        this.heroInterval = setInterval(callback, 3500);
    },

    /**
     * Clean up intervals (called when leaving page or re-init)
     */
    cleanup: function () {
        if (this.heroInterval) {
            clearInterval(this.heroInterval);
            this.heroInterval = null;
        }
    }
};

// Make sure it's available globally
window.HomeLogic = HomeLogic;
