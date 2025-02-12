$(document).ready(function() {
    // Add smooth scroll animation for internal links
    $('a[href^="/#"]').click(function(e) {
        e.preventDefault();
        const target = $(this.hash);
        if (target.length) {
            $('html, body').animate({
                scrollTop: target.offset().top - 80
            }, 500);
        }
    });

    // Add hover and click animations for action cards
    $('.action-card').hover(
        function() {
            $(this).addClass('transform scale-105');
        },
        function() {
            $(this).removeClass('transform scale-105');
        }
    ).click(function() {
        $(this).addClass('transform scale-95');
        setTimeout(() => {
            $(this).removeClass('transform scale-95');
        }, 200);
    });

    // Add loading animation for recent QR codes
    $('.recent-code').each(function(index) {
        $(this).delay(index * 100).animate({
            opacity: 1,
            transform: 'translateY(0)'
        }, 500);
    });
});
