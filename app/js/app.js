document.addEventListener("DOMContentLoaded", function () {

    function initFullPageSlider() {
        const slider = document.querySelector('.page-wrapper__inner');
        const logo = document.querySelector('.logo');
        const titles = document.querySelectorAll('.title');
        
        if (slider) {
            if (window.innerWidth > 768) {
                const fullPage = $('.page-wrapper__inner').pagepiling({
                    menu: null,
                    direction: 'vertical',
                    verticalCentered: true,
                    sectionsColor: [],
                    anchors: [],
                    scrollingSpeed: 1000,
                    easing: 'swing',
                    loopBottom: false,
                    loopTop: false,
                    css3: true,
                    navigation: {
                        'bulletsColor': '#eaad5a',
                        'position': 'left',
                    },
                    normalScrollElements: null,
                    normalScrollElementTouchThreshold: 5,
                    touchSensitivity: 5,
                    keyboardScrolling: true,
                    sectionSelector: '.section',
                    animateAnchor: false,
            
                    //events
                    onLeave: function(index, nextIndex, direction){
                        const pagination = document.querySelector('#pp-nav');

                        titles.forEach(title => {
                            setTimeout(function(){
                                title.classList.add('animated');
                            }, 500)
        
                            setTimeout(function (){
                                title.classList.remove('animated');
                            }, 1500)
                        }) 
                            if (nextIndex === 1) {
                                pagination.style.transition = '';
                                pagination.style.opacity = '0';
                                pagination.style.visibility = 'hidden';
                                logo.style.transition = '';
                                logo.style.opacity = '0';
                                logo.style.visibility = 'hidden';
                            } else {
                                pagination.style.opacity = '';
                                logo.style.opacity = '';
                                pagination.style.visibility = '';
                                logo.style.visibility = '';
                                
                            }
                            
                            if (nextIndex === 3) {
                                setTimeout(function(){
                                    document.querySelector('.who__bar-line').classList.add('animated');
                                }, 500)
                            } else if (nextIndex === 5) {
                                setTimeout(function(){
                                    document.querySelector('.rewarding__bar').classList.add('animated');
                                }, 500)
                            } else if (nextIndex === 7) {
                                setTimeout(function(){
                                    document.querySelector('.lead__btn').classList.add('animated');
                                }, 500)
                            }
                        },
                        
                        afterRender: function(){
                            const pagination = document.querySelector('#pp-nav');

                            pagination.style.transition = 'none';
                            pagination.style.opacity = '0';
                            pagination.style.visibility = 'hidden';
                            logo.style.transition = 'none';
                            logo.style.opacity = '0';
                            logo.style.visibility = 'hidden';
                            
                            setTimeout(function() {
                                pagination.style.transition = '';
                                logo.style.transition = '';
                            }, 10)
                        },
                });
    
            
            } else {
                slider.querySelectorAll('.section').forEach(item => item.classList.remove('section'))
            }
        }
    }

    function initMobileAnimations() {
        if (window.innerWidth <= 768) {
            
            const scrollElements = document.querySelectorAll(".js-scroll");
            
            const elementInView = (el, dividend = 1) => {
                const elementTop = el.getBoundingClientRect().top;
                
                return (
                    elementTop <=
                    (window.innerHeight || document.documentElement.clientHeight) / dividend
                );
            };
            
            const elementOutofView = (el) => {
                const elementTop = el.getBoundingClientRect().top;
                
                return (
                    elementTop > (window.innerHeight || document.documentElement.clientHeight)
                );
            };
            
            const displayScrollElement = (element) => {
                element.classList.add("animated");
            };
            
            const hideScrollElement = (element) => {
                element.classList.remove("animated");
            };
            
            const handleScrollAnimation = () => {
                scrollElements.forEach((el) => {
                    if (elementInView(el, 1.25)) {
                    displayScrollElement(el);
                    } else if (elementOutofView(el)) {
                    hideScrollElement(el)
                    }
                })
            }
            
            window.addEventListener("scroll", () => { 
                handleScrollAnimation();
            });
            
        }
    }

    function disableTransitionsBeforePageLoading() {
        if (document.body.classList.contains('preload')) {
            document.body.classList.remove('preload');
        }
    }
    
    disableTransitionsBeforePageLoading();
    initFullPageSlider();
    initMobileAnimations();
});
