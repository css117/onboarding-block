import { __ } from '@wordpress/i18n';
import { registerBlockType, createBlock } from '@wordpress/blocks';
import { useBlockProps, InspectorControls, InnerBlocks } from '@wordpress/block-editor';
import { PanelBody, TextControl, ToggleControl, RangeControl, ColorPicker } from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import metadata from './block.json';

const IconPopup = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path d="M13 2H3C1.4 2 0 3.4 0 5v6c0 1.6 1.4 3 3 3h10c1.3 0 2.4-.8 2.8-2 .1-.3.2-.6.2-1V5c0-1.6-1.4-3-3-3m1 9c0 .6-.4 1-1 1H3c-.5 0-1-.4-1-1V5c0-.5.5-1 1-1h10c.6 0 1 .5 1 1z"/>
        <path d="M20 9v6c0 1.6-1.4 3-3 3H7c-1.7 0-3-1.4-3-3v-1h2v1c0 .6.4 1 1 1h10c.5 0 1-.4 1-1V9c0-.6-.5-1-1-1h-1V6h1c1.6 0 3 1.3 3 3"/>
        <path d="M24 13v6c0 1.6-1.4 3-3 3H11c-1.6 0-3-1.4-3-3v-1h2v1c0 .5.4 1 1 1h10c.5 0 1-.5 1-1v-6c0-.6-.5-1-1-1h-1v-2h1c1.6 0 3 1.4 3 3"/>
    </svg>
);

function Edit({ attributes, setAttributes, clientId }) {
    const { accentColor, labelPrev, labelNext, labelDone, cookieName, cookieDays, triggerText, showTrigger } = attributes;

    const slideCount = useSelect( select =>
        select( 'core/block-editor' ).getBlockCount( clientId )
    );

    const { insertBlock } = useDispatch( 'core/block-editor' );

    function addSlide() {
        insertBlock( createBlock( 'onboarding/slide' ), undefined, clientId );
    }

    const blockProps = useBlockProps( { className: 'wp-block-onboarding-popup' } );

    return (
        <>
            <InspectorControls>
                <PanelBody title={ __( 'Appearance', 'onboarding-block' ) } initialOpen={ true }>
                    <p style={{ marginBottom: '4px', fontWeight: 600, fontSize: '11px' }}>
                        { __( 'Accent color', 'onboarding-block' ) }
                    </p>
                    <ColorPicker
                        color={ accentColor }
                        onChangeComplete={ c => setAttributes({ accentColor: c.hex }) }
                        disableAlpha={ true }
                    />
                </PanelBody>
                <PanelBody title={ __( 'Navigation', 'onboarding-block' ) } initialOpen={ false }>
                    <TextControl
                        label={ __( 'Previous button', 'onboarding-block' ) }
                        value={ labelPrev } placeholder="←"
                        onChange={ v => setAttributes({ labelPrev: v }) }
                    />
                    <TextControl
                        label={ __( 'Next button', 'onboarding-block' ) }
                        value={ labelNext } placeholder="→"
                        onChange={ v => setAttributes({ labelNext: v }) }
                    />
                    <TextControl
                        label={ __( 'Done button', 'onboarding-block' ) }
                        value={ labelDone } placeholder="✓"
                        onChange={ v => setAttributes({ labelDone: v }) }
                    />
                </PanelBody>
                <PanelBody title={ __( 'Settings', 'onboarding-block' ) } initialOpen={ false }>
                    <TextControl
                        label={ __( 'Cookie name', 'onboarding-block' ) }
                        value={ cookieName }
                        onChange={ v => setAttributes({ cookieName: v }) }
                        help={ __( 'Unique identifier if you have multiple popups.', 'onboarding-block' ) }
                    />
                    <RangeControl
                        label={ __( 'Cookie duration (days)', 'onboarding-block' ) }
                        value={ cookieDays }
                        min={ 1 } max={ 365 }
                        onChange={ v => setAttributes({ cookieDays: v }) }
                    />
                    <ToggleControl
                        label={ __( 'Show reopen link', 'onboarding-block' ) }
                        checked={ showTrigger }
                        onChange={ v => setAttributes({ showTrigger: v }) }
                    />
                    { showTrigger && (
                        <TextControl
                            label={ __( 'Link text', 'onboarding-block' ) }
                            value={ triggerText }
                            onChange={ v => setAttributes({ triggerText: v }) }
                        />
                    ) }
                </PanelBody>
            </InspectorControls>

            <div { ...blockProps }>
                <InnerBlocks
                    allowedBlocks={ ['onboarding/slide'] }
                    renderAppender={ false }
                />
                <button
                    type="button"
                    className="ob-add-slide-btn"
                    onClick={ addSlide }
                >
                    { __( '+ Add a slide', 'onboarding-block' ) } ({ slideCount })
                </button>
            </div>
        </>
    );
}

registerBlockType( metadata, {
    icon: <IconPopup />,
    edit: Edit,
    save: () => <InnerBlocks.Content />,
} );