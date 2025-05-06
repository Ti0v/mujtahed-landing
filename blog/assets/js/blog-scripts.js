/**
 * مجتهد أكاديمي - سكريبت المدونة
 * @version 1.0.0
 * @author مجتهد أكاديمي
 */

document.addEventListener('DOMContentLoaded', function() {
    // تهيئة العناصر التفاعلية
    initBackToTop();
    initMobileNav();
    initLazyLoading();
    initSocialShare();
    initSmoothScroll();
    initSearchValidation();
    initTableResponsive();
    initReadingProgress();
});

/**
 * إظهار زر العودة للأعلى عند التمرير
 */
function initBackToTop() {
    const backToTop = document.getElementById('backToTop');
    if (!backToTop) return;

    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });

    // التمرير السلس للأعلى
    backToTop.addEventListener('click', function(e) {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

/**
 * تهيئة قائمة التنقل للجوال
 */
function initMobileNav() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const blogNav = document.querySelector('.blog-nav');
    
    if (!mobileMenuToggle || !blogNav) return;

    mobileMenuToggle.addEventListener('click', function() {
        blogNav.classList.toggle('active');
        
        // تغيير أيقونة القائمة
        const icon = mobileMenuToggle.querySelector('i');
        if (icon) {
            if (blogNav.classList.contains('active')) {
                icon.className = 'fas fa-times';
            } else {
                icon.className = 'fas fa-bars';
            }
        }
    });

    // إغلاق القائمة عند النقر خارجها
    document.addEventListener('click', function(event) {
        const isClickInsideMenu = blogNav.contains(event.target);
        const isClickOnToggle = mobileMenuToggle.contains(event.target);
        
        if (!isClickInsideMenu && !isClickOnToggle && blogNav.classList.contains('active')) {
            blogNav.classList.remove('active');
            const icon = mobileMenuToggle.querySelector('i');
            if (icon) {
                icon.className = 'fas fa-bars';
            }
        }
    });
}

/**
 * تهيئة التحميل الكسول للصور
 */
function initLazyLoading() {
    // تحقق إذا كان المتصفح يدعم Intersection Observer API
    if ('IntersectionObserver' in window) {
        const lazyImages = document.querySelectorAll('img[loading="lazy"]');
        
        const imageObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    const lazyImage = entry.target;
                    lazyImage.src = lazyImage.dataset.src || lazyImage.src;
                    
                    if (lazyImage.dataset.srcset) {
                        lazyImage.srcset = lazyImage.dataset.srcset;
                    }
                    
                    lazyImage.classList.add('loaded');
                    imageObserver.unobserve(lazyImage);
                }
            });
        }, {
            rootMargin: '100px 0px'
        });

        lazyImages.forEach(function(lazyImage) {
            imageObserver.observe(lazyImage);
        });
    }
}

/**
 * تهيئة أزرار مشاركة المقالة
 */
function initSocialShare() {
    const shareButtons = document.querySelectorAll('.share-btn');
    
    shareButtons.forEach(function(button) {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const url = this.getAttribute('href');
            const windowFeatures = 'width=550,height=420,resizable=yes,scrollbars=yes,status=yes';
            window.open(url, 'share', windowFeatures);
            
            // تتبع المشاركة في Google Analytics إذا كان متاحاً
            if (typeof gtag === 'function') {
                gtag('event', 'share', {
                    'method': this.classList.contains('facebook') ? 'Facebook' :
                              this.classList.contains('twitter') ? 'Twitter' :
                              this.classList.contains('whatsapp') ? 'WhatsApp' :
                              this.classList.contains('telegram') ? 'Telegram' : 'Other',
                    'content_type': 'blog_post',
                    'item_id': window.location.pathname
                });
            }
        });
    });
}

/**
 * تسلس انتقال الروابط الداخلية
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

/**
 * التحقق من نموذج البحث قبل الإرسال
 */
function initSearchValidation() {
    const searchForms = document.querySelectorAll('.search-form');
    
    searchForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const searchInput = this.querySelector('input[type="text"]');
            
            if (!searchInput || !searchInput.value.trim()) {
                e.preventDefault();
                searchInput.focus();
                
                // إضافة تنبيه بصري للمستخدم
                searchInput.classList.add('error');
                
                setTimeout(() => {
                    searchInput.classList.remove('error');
                }, 1000);
            }
        });
    });
}

/**
 * جعل كل الجداول متجاوبة في المقالات
 */
function initTableResponsive() {
    const tables = document.querySelectorAll('.article-body table');
    
    tables.forEach(table => {
        // إنشاء غلاف div للجدول للتجاوب
        const wrapper = document.createElement('div');
        wrapper.className = 'table-container';
        
        // استبدال الجدول بالغلاف الجديد المحتوي على الجدول
        table.parentNode.insertBefore(wrapper, table);
        wrapper.appendChild(table);
    });
}

/**
 * مؤشر تقدم القراءة في المقالات
 */
function initReadingProgress() {
    const articleBody = document.querySelector('.article-body');
    const progressBar = document.getElementById('readingProgress');
    
    if (articleBody && progressBar) {
        window.addEventListener('scroll', function() {
            const articleHeight = articleBody.offsetHeight;
            const articleTop = articleBody.offsetTop;
            const windowHeight = window.innerHeight;
            const scrollY = window.scrollY;
            
            // احتساب نسبة التقدم
            let progress = 0;
            if (scrollY > articleTop) {
                const totalToRead = articleHeight + articleTop - windowHeight;
                const currentProgress = scrollY - articleTop;
                progress = Math.min((currentProgress / totalToRead) * 100, 100);
            }
            
            progressBar.style.width = progress + '%';
        });
    }
}

/**
 * إنشاء وتحديث مقدار وقت القراءة
 * يتم استدعاؤها من كود HTML الصفحة
 */
function calculateReadingTime(element) {
    if (!element) return;
    
    const text = element.textContent;
    const wordCount = text.trim().split(/\s+/).length;
    
    // متوسط سرعة القراءة بالعربية (كلمة/دقيقة)
    const wordsPerMinute = 200;
    
    // حساب الوقت بالدقائق وتقريبه
    let readTime = Math.ceil(wordCount / wordsPerMinute);
    
    // التأكد من عرض دقيقة واحدة على الأقل
    readTime = readTime < 1 ? 1 : readTime;
    
    // إرجاع النص مع وقت القراءة
    return readTime + ' دقيقة قراءة';
}

/**
 * إضافة تفاعلات للمقالات المقترحة
 */
function initRelatedPostsSlider() {
    const sliderContainer = document.querySelector('.related-articles-slider');
    if (!sliderContainer) return;
    
    let isDown = false;
    let startX;
    let scrollLeft;

    sliderContainer.addEventListener('mousedown', (e) => {
        isDown = true;
        startX = e.pageX - sliderContainer.offsetLeft;
        scrollLeft = sliderContainer.scrollLeft;
        sliderContainer.style.cursor = 'grabbing';
    });
    
    sliderContainer.addEventListener('mouseleave', () => {
        isDown = false;
        sliderContainer.style.cursor = 'grab';
    });
    
    sliderContainer.addEventListener('mouseup', () => {
        isDown = false;
        sliderContainer.style.cursor = 'grab';
    });
    
    sliderContainer.addEventListener('mousemove', (e) => {
        if(!isDown) return;
        e.preventDefault();
        const x = e.pageX - sliderContainer.offsetLeft;
        const walk = (x - startX) * 2; // سرعة السحب
        sliderContainer.scrollLeft = scrollLeft - walk;
    });
}

/**
 * تتبع النقرات على روابط المقالات
 */
function trackArticleClicks() {
    document.querySelectorAll('.article-title a').forEach(link => {
        link.addEventListener('click', function() {
            if (typeof gtag !== 'undefined') {
                gtag('event', 'article_click', {
                    'article_title': this.textContent,
                    'article_url': this.getAttribute('href')
                });
            }
        });
    });
}

/**
 * تغيير الطريقة المستخدمة لنموذج التعليقات
 */
function setupCommentForm() {
    const commentForm = document.querySelector('.comment-form form');
    if (!commentForm) return;
    
    commentForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // هنا يمكن إضافة كود للتحقق من النموذج أو إرسال التعليق أو عرض رسالة نجاح
        const formData = new FormData(this);
        const commentText = formData.get('comment');
        
        if (!commentText || commentText.trim() === '') {
            alert('يرجى كتابة تعليقك قبل الإرسال');
            return;
        }
        
        // إظهار رسالة نجاح (في التطبيق الحقيقي، سيتم إرسال البيانات إلى الخادم)
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.textContent = 'تم إرسال تعليقك بنجاح وهو في انتظار المراجعة';
        
        this.parentNode.insertBefore(successMessage, this.nextSibling);
        this.reset();
        
        // إخفاء رسالة النجاح بعد 5 ثوانٍ
        setTimeout(() => {
            successMessage.style.opacity = '0';
            setTimeout(() => {
                successMessage.remove();
            }, 500);
        }, 5000);
    });
}

/**
 * مشاركة في الشبكات الاجتماعية بدون رابط
 * @param {string} platform - اسم المنصة (facebook, twitter, whatsapp, telegram)
 */
function shareOnSocial(platform) {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(document.title);
    
    let shareUrl = '';
    
    switch(platform) {
        case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
            break;
        case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
            break;
        case 'whatsapp':
            shareUrl = `https://api.whatsapp.com/send?text=${title} ${url}`;
            break;
        case 'telegram':
            shareUrl = `https://t.me/share/url?url=${url}&text=${title}`;
            break;
    }
    
    if (shareUrl) {
        window.open(shareUrl, 'share', 'width=550,height=420,resizable=yes,scrollbars=yes,status=yes');
        
        // تتبع المشاركة في Google Analytics إذا كان متاحاً
        if (typeof gtag === 'function') {
            gtag('event', 'share', {
                'method': platform,
                'content_type': 'blog_post',
                'item_id': window.location.pathname
            });
        }
    }
}