jQuery(document).ready(function($) {
    'use strict';

    /* ==========================================================================
    ACCORDION
    ========================================================================== */
    $('.accordion .collapse').on('shown.bs.collapse', function() {
        $(this).parent().find(".pe-7s-angle-right-circle").removeClass("pe-7s-angle-right-circle").addClass("pe-7s-angle-down-circle");
        $(this).parent().addClass("actives");
    }).on('hidden.bs.collapse', function() {
        $(this).parent().find(".pe-7s-angle-down-circle").removeClass("pe-7s-angle-down-circle").addClass("pe-7s-angle-right-circle");
        $(this).parent().removeClass("actives");
    });


    /* ==========================================================================
     CIRCULAR SKILLS
     ========================================================================== */
    $('.chart').easyPieChart({
        barColor: '#1674D1',
        trackColor: '#eeeeee',
        scaleColor: '#ffffff',
        scaleLength: 0,
        lineCap: 'none',
        size: 216,
        lineWidth: 5
    });

    /* ==========================================================================
    CIRCULAR SKILLS
    ========================================================================== */

    $('.chart-dark').easyPieChart({
        barColor: '#1674D1',
        trackColor: '#333333',
        scaleColor: '#111111',
        scaleLength: 0,
        lineCap: 'none',
        size: 216,
        lineWidth: 5
    });

    /* ==========================================================================
    TESTIMONIAL CAROUSEL
    ========================================================================== */
    $('.testimonials-carousel').slick({
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: true,
        asNavFor: '.testimonials-carousel-nav'
    });

    $('.testimonials-carousel-nav').slick({
        arrows: false,
        slidesToShow: 5,
        slidesToScroll: 1,
        asNavFor: '.testimonials-carousel',
        focusOnSelect: true
    });


    /* ==========================================================================
    HEADER CART
    ========================================================================== */
    var $mini_cart = $('.mini-cart');
    $mini_cart.on('click', function(e) {
        $(this).addClass('open');
    });

    $(document).on('click', function(e) {
        if ($(e.target).closest($mini_cart).length == 0) {
            $mini_cart.removeClass('open');
        }
    });

    /* ==========================================================================
    HEADER SEARCH
    ========================================================================== */
    var $search_btn = $('.search-box > i'),
        $search_form = $('form.search-form');

    $search_btn.on('click', function() {
        $search_form.toggleClass('open');
    });

    $(document).on('click', function(e) {
        if ($(e.target).closest($search_btn).length == 0 && $(e.target).closest('input.search-field').length == 0 && $search_form.hasClass('open')) {
            $search_form.removeClass('open');
        }
    });

    /* ==========================================================================
    POST GALLERY
    ========================================================================== */
    $(".post-gallery.slider").owlCarousel({

        navigation: true,
        slideSpeed: 300,
        paginationSpeed: 400,
        singleItem: true,
        pagination: false,
        autoHeight: true,
        transitionStyle: "fade"
    });

    /* ==========================================================================
    TESTIMONIAL CAROUSEL2
    ========================================================================== */

    $("#quote-carousel").owlCarousel({
        navigation: false, // Show next and prev buttons
        slideSpeed: 400,
        pagination: true,
        paginationSpeed: 400,
        singleItem: true
    });

    /* ==========================================================================
    TESTIMONIAL CAROUSEL3
    ========================================================================== */
    $("#quote-carousel-lite").owlCarousel({
        navigation: true, // Show next and prev buttons
        slideSpeed: 400,
        pagination: false,
        paginationSpeed: 400,
        singleItem: true
    });

    /* ==========================================================================
    TESTIMONIAL CAROUSEL4
    ========================================================================== */

    $("#quote-carousel-gray").owlCarousel({
        navigation: true, // Show next and prev buttons
        slideSpeed: 400,
        pagination: false,
        paginationSpeed: 400,
        singleItem: true
    });

    /* ==========================================================================
    STATS COUNTER
    ========================================================================== */
    $('.counter').counterUp({
        delay: 10,
        time: 1000
    });

    /* ==========================================================================
    MOBILE MENU / SIDEMENU
    ========================================================================== */
    var snapper = new Snap({
        element: document.getElementById('wrapper'),
        dragger: document.getElementsByClassName('page'),
        slideIntent: 10,
    });
    if (jQuery('#open-left').length > 0) {
        var addEvent = function addEvent(element, eventName, func) {
            if (element.addEventListener) {
                return element.addEventListener(eventName, func, false);
            } else if (element.attachEvent) {
                return element.attachEvent("on" + eventName, func);
            }
        };
        addEvent(document.getElementById('open-left'), 'click', function() {
            snapper.open('left');
        });
        if (jQuery('#open-right').length > 0) {
            addEvent(document.getElementById('open-right'), 'click', function() {
                snapper.open('right');
            });
            addEvent(document.getElementById('close-right'), 'click', function() {
                if (snapper.state().state == "right") {
                    snapper.close('right');
                }
            });
        }
    }

    /* ==========================================================================
    MOBILE MENU DROPDOWN
    ========================================================================== */
    var $menu = $('.mobile-menu');

    $menu.find('#mobile-menu li.menu-item-has-children > a, .sub-menu-toggle').on('click', function(e) {
        e.preventDefault();
        var subMenu = $(this).siblings('.sub-menu');

        if (subMenu.css('display') == 'block') {
            subMenu.css('display', 'block').slideUp().parent().removeClass('expand');
        } else {
            subMenu.css('display', 'none').slideDown().parent().addClass('expand');
        }
        e.stopPropagation();
    });


    /* ==========================================================================
    CLIENTS CAROUSEL
    ========================================================================== */

    var owl = $("#clients_ul");

    owl.owlCarousel({

        itemsCustom: [
            [0, 2],
            [450, 3],
            [600, 3],
            [700, 3],
            [1000, 5],
            [1200, 5],
            [1400, 5],
            [1600, 5]
        ],
        navigation: false,
        pagination: false

    });

    /* ==========================================================================
    PRETTYPHOTO LIGHTBOX
    ========================================================================== */
    $("a[class^='prettyPhoto']").prettyPhoto({
        theme: 'pp_default'
    });


    /* ==========================================================================
    SHOP CHECKOUT
    ========================================================================== */

    $('#payment_method_bacs').on('click', function() {
        $(".payment_method_bacs").addClass("active");
        $(".payment_method_cheque").removeClass("active");
        $(".payment_method_paypal").removeClass("active");
    });

    $('#payment_method_cheque').on('click', function() {
        $(".payment_method_cheque").addClass("active");
        $(".payment_method_bacs").removeClass("active");
        $(".payment_method_paypal").removeClass("active");

    });

    $('#payment_method_paypal').on('click', function() {
        $(".payment_method_paypal").addClass("active");
        $(".payment_method_bacs").removeClass("active");
        $(".payment_method_cheque").removeClass("active");
    });

    /* ==========================================================================
    SHOP SINGLE REVIEW TAB
    ========================================================================== */
    $('.wc-tabs-wrapper, .shop-content-tabs')
        .on('init', function() {
            $('.wc-tab, .shop-content-tabs .panel:not(.panel .panel)').hide();

            var hash = window.location.hash;
            var url = window.location.href;
            var $tabs = $(this).find('.wc-tabs, ul.tabs').first();

            if (hash.toLowerCase().indexOf('comment-') >= 0 || hash === '#reviews') {
                $tabs.find('li.reviews_tab a').click();
            } else if (url.indexOf('comment-page-') > 0 || url.indexOf('cpage=') > 0) {
                $tabs.find('li.reviews_tab a').click();
            } else {
                $tabs.find('li:first a').click();
            }
        })
        .on('click', '.wc-tabs li a, ul.tabs li a', function() {
            var $tab = $(this);
            var $tabs_wrapper = $tab.closest('.wc-tabs-wrapper, .shop-content-tabs');
            var $tabs = $tabs_wrapper.find('.wc-tabs, ul.tabs');

            $tabs.find('li').removeClass('active');
            $tabs_wrapper.find('.wc-tab, .panel:not(.panel .panel)').hide();

            $tab.closest('li').addClass('active');
            $tabs_wrapper.find($tab.attr('href')).show();

            return false;
        })
        .trigger('init');

    $('a.shop-content-review-link').on('click', function() {
        $('.reviews_tab a').click();
        return true;
    });

    /* ==========================================================================
    Background Video Player
    ========================================================================== */
    if ($(".bg-video-player").length) {
        $(".bg-video-player").YTPlayer();
    }

    /* ==========================================================================
    BACK TO TOP BUTTON
    ========================================================================== */
    var $window = $(window);
    /* ==========================================================================
    Scroll up
    ========================================================================== */
    var $scrollup = $('.scrollup');

    $window.scroll(function() {
        if ($window.scrollTop() > 100) {
            $scrollup.addClass('show');
        } else {
            $scrollup.removeClass('show');
        }
    });

    $scrollup.on('click', function(evt) {
        $("html, body").animate({
            scrollTop: 0
        }, 600);
        evt.preventDefault();
    });

});
