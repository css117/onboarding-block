import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, InnerBlocks, BlockControls, BlockVerticalAlignmentToolbar, JustifyContentControl } from '@wordpress/block-editor';
import metadata from './block.json';

const IconSlide = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path d="M13 2H3C1.4 2 0 3.4 0 5v6c0 1.7 1.4 3 3 3v-2c-.5 0-1-.4-1-1V5c0-.5.5-1 1-1h10c.6 0 1 .5 1 1h2c0-1.6-1.3-3-3-3"/>
        <rect width="14" height="10" x="5" y="7" rx="2" ry="2"/>
        <path d="M21 10v2c.6 0 1 .4 1 1v6c0 .5-.4 1-1 1H11c-.6 0-1-.5-1-1H8c0 1.7 1.4 3 3 3h10c1.7 0 3-1.3 3-3v-6c0-1.6-1.3-3-3-3"/>
    </svg>
);

function Edit({ attributes, setAttributes }) {
    const { verticalAlignment, horizontalAlignment } = attributes;

    const blockProps = useBlockProps( { className: 'ob-slide-editor' } );

    const innerClass = [
        'ob-slide-inner',
        `is-vertically-aligned-${ verticalAlignment }`,
        `is-horizontally-justified-${ horizontalAlignment }`,
    ].join( ' ' );

    return (
        <>
            <BlockControls>
                <BlockVerticalAlignmentToolbar
                    value={ verticalAlignment }
                    onChange={ v => setAttributes({ verticalAlignment: v }) }
                />
                <JustifyContentControl
                    allowedControls={ ['left', 'center', 'right'] }
                    value={ horizontalAlignment }
                    onChange={ v => setAttributes({ horizontalAlignment: v }) }
                />
            </BlockControls>

            <div { ...blockProps }>
                <div className={ innerClass }>
                    <InnerBlocks templateLock={ false } />
                </div>
            </div>
        </>
    );
}

registerBlockType( metadata, {
    icon: <IconSlide />,
    edit: Edit,
    save: () => <InnerBlocks.Content />,
} );