<?php
/**
 * Plugin Name: Onboarding Popup Block
 * Description: Onboarding carousel popup — free Gutenberg content per slide.
 * Version: 3.0.0
 * Author: Claude.ai & Giboo.fr
 * Text Domain: onboarding-block
 */

if ( ! defined( 'ABSPATH' ) ) exit;

add_action( 'init', function () {
    load_plugin_textdomain( 'onboarding-block', false, dirname( plugin_basename( __FILE__ ) ) . '/languages' );
} );

add_action( 'init', function () {
    register_block_type( __DIR__ . '/blocks/popup/block.json', [
        'render_callback' => 'onboarding_popup_render',
    ] );
    register_block_type( __DIR__ . '/blocks/slide/block.json', [
        'render_callback' => 'onboarding_slide_render',
    ] );
} );

// ── Slide render ──────────────────────────────────────────────────────────────
function onboarding_slide_render( $attributes, $content, $block ) {
    // Add cover class only when the slide contains a single image or video block
    $inner       = $block->parsed_block['innerBlocks'] ?? [];
    $real_blocks = array_values( array_filter( $inner, fn( $b ) => ! empty( $b['blockName'] ) ) );

    $is_cover_image = count( $real_blocks ) === 1
        && $real_blocks[0]['blockName'] === 'core/image';
    $is_cover_video = count( $real_blocks ) === 1
        && in_array( $real_blocks[0]['blockName'], [ 'core/video', 'core/embed' ] );

    $valign = $attributes['verticalAlignment']   ?? 'top';
    $halign = $attributes['horizontalAlignment'] ?? 'left';

    $slide_class = 'ob-slide';
    if ( $is_cover_image ) $slide_class .= ' ob-slide--has-cover-image';
    if ( $is_cover_video ) $slide_class .= ' ob-slide--has-cover-video';

    $inner_class = implode( ' ', [
        'ob-slide-inner',
        'is-vertically-aligned-' . $valign,
        'is-horizontally-justified-' . $halign,
    ] );

    return '<div class="' . $slide_class . '" hidden>'
         . '<div class="' . $inner_class . '">'
         . $content
         . '</div></div>';
}

// ── Popup render ──────────────────────────────────────────────────────────────
function onboarding_popup_render( $attributes, $content ) {
    $nb = preg_match_all( '/class="ob-slide(?:"| )/', $content );
    if ( $nb === 0 ) return '';

    $cookie_name  = sanitize_key( $attributes['cookieName']  ?? 'onboarding_done' );
    $cookie_days  = intval( $attributes['cookieDays']        ?? 365 );
    $trigger_text = esc_html( $attributes['triggerText']     ?? 'Revoir le tutoriel' );
    $show_trigger = ! empty( $attributes['showTrigger'] );
    $accent_color = esc_attr( $attributes['accentColor']     ?? '#2271b1' );
    $label_prev   = $attributes['labelPrev'] ?? '';
    $label_next   = $attributes['labelNext'] ?? '';
    $label_done   = $attributes['labelDone'] ?? '';
    $uid          = esc_attr( $cookie_name );

    ob_start(); ?>

    <?php if ( $show_trigger ) : ?>
    <div class="ob-block-wrap">
        <a href="#" class="ob-open-trigger" data-ob-target="<?php echo $uid; ?>"><?php echo $trigger_text; ?></a>
    </div>
    <?php endif; ?>

    <div class="ob-overlay" id="ob-<?php echo $uid; ?>" role="dialog" aria-modal="true">
        <div class="ob-box" style="--ob-accent:<?php echo $accent_color; ?>">
            <button class="ob-close" aria-label="<?php esc_attr_e( 'Close', 'onboarding-block' ); ?>">&#x2715;</button>
            <div class="ob-slides-wrap">
                <?php echo $content; ?>
            </div>
            <div class="ob-footer">
                <button class="ob-prev ob-btn" aria-label="<?php esc_attr_e( 'Previous', 'onboarding-block' ); ?>"></button>
                <div class="ob-dots"></div>
                <button class="ob-next ob-btn" aria-label="<?php esc_attr_e( 'Next', 'onboarding-block' ); ?>"></button>
            </div>
            <div class="ob-progress-bar"></div>
        </div>
    </div>

    <script>
    (function() {
        var COOKIE = <?php echo wp_json_encode( $cookie_name ); ?>;
        var DAYS   = <?php echo intval( $cookie_days ); ?>;
        var NB     = <?php echo intval( $nb ); ?>;
        var L_PREV = <?php echo wp_json_encode( $label_prev ?: '←' ); ?>;
        var L_NEXT = <?php echo wp_json_encode( $label_next ?: '→' ); ?>;
        var L_DONE = <?php echo wp_json_encode( $label_done ?: '✓' ); ?>;

        var overlay  = document.getElementById( 'ob-' + COOKIE );
        if ( ! overlay ) return;

        var cur      = 0;
        var slides   = overlay.querySelectorAll( '.ob-slides-wrap > .ob-slide' );
        var dotsEl   = overlay.querySelector( '.ob-dots' );
        var prevBtn  = overlay.querySelector( '.ob-prev' );
        var nextBtn  = overlay.querySelector( '.ob-next' );
        var progress = overlay.querySelector( '.ob-progress-bar' );

        dotsEl.innerHTML = Array.from( { length: NB } ).map( function () {
            return '<span class="ob-dot"></span>';
        } ).join( '' );
        var dots = dotsEl.querySelectorAll( '.ob-dot' );

        function render() {
            slides.forEach( function ( s, i ) { s.hidden = ( i !== cur ); } );
            dots.forEach( function ( d, i )   { d.classList.toggle( 'active', i === cur ); } );
            prevBtn.textContent = L_PREV;
            nextBtn.textContent = ( cur === NB - 1 ) ? L_DONE : L_NEXT;
            prevBtn.disabled    = ( cur === 0 );
            progress.style.width = ( ( cur + 1 ) / NB * 100 ) + '%';
        }

        function setCookie() {
            var d = new Date();
            d.setTime( d.getTime() + DAYS * 86400000 );
            document.cookie = COOKIE + '=1; expires=' + d.toUTCString() + '; path=/';
        }

        function hasCookie() {
            return document.cookie.split( ';' ).some( function ( c ) {
                return c.trim().indexOf( COOKIE + '=' ) === 0;
            } );
        }

        function openPopup()  { cur = 0; render(); overlay.classList.add( 'active' ); }
        function closePopup() { overlay.classList.remove( 'active' ); setCookie(); }

        overlay.querySelector( '.ob-close' ).addEventListener( 'click', closePopup );
        overlay.addEventListener( 'click', function ( e ) { if ( e.target === overlay ) closePopup(); } );

        prevBtn.addEventListener( 'click', function () { if ( cur > 0 ) { cur--; render(); } } );
        nextBtn.addEventListener( 'click', function () {
            if ( cur < NB - 1 ) { cur++; render(); } else { closePopup(); }
        } );

        document.addEventListener( 'keydown', function ( e ) {
            if ( ! overlay.classList.contains( 'active' ) ) return;
            if ( e.key === 'Escape' )     { closePopup(); return; }
            if ( e.key === 'ArrowRight' ) { if ( cur < NB - 1 ) { cur++; render(); } return; }
            if ( e.key === 'ArrowLeft' )  { if ( cur > 0 ) { cur--; render(); } }
        } );

        document.querySelectorAll( '.ob-open-trigger[data-ob-target="' + COOKIE + '"]' ).forEach( function ( el ) {
            el.addEventListener( 'click', function ( e ) { e.preventDefault(); openPopup(); } );
        } );

        if ( ! hasCookie() ) { openPopup(); }
    } )();
    </script>

    <?php
    return ob_get_clean();
}
