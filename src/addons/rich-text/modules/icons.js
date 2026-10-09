import { renderIcon } from 'custom-ui';

export const arrowBackUp = (strokeWidth = 2, attr = {}) => renderIcon(['M9 14l-4 -4l4 -4', 'M5 10h11a4 4 0 1 1 0 8h-1'], strokeWidth, attr);
export const arrowForwardUp = (strokeWidth = 2, attr = {}) => renderIcon(['M15 14l4 -4l-4 -4', 'M19 10h-11a4 4 0 1 0 0 8h1'], strokeWidth, attr);
export const bold = (strokeWidth = 3, attr = {}) => renderIcon(['M7 5h6a3.5 3.5 0 0 1 0 7h-6l0 -7', 'M13 12h1a3.5 3.5 0 0 1 0 7h-7v-7'], strokeWidth, attr);
export const bulletList = (strokeWidth = 2, attr = {}) => renderIcon(['M9 6l11 0', 'M9 12l11 0', 'M9 18l11 0', 'M5 6l0 .01', 'M5 12l0 .01', 'M5 18l0 .01'], strokeWidth, attr);
export const italic = (strokeWidth = 2, attr = {}) => renderIcon(['M11 5l6 0', 'M7 19l6 0', 'M14 5l-4 14'], strokeWidth, attr);
export const link = (strokeWidth = 2, attr = {}) =>
    renderIcon(
        ['M9 15l6 -6', 'M11 6l.463 -.536a5 5 0 0 1 7.071 7.072l-.534 .464', 'M13 18l-.397 .534a5.068 5.068 0 0 1 -7.127 0a4.972 4.972 0 0 1 0 -7.071l.524 -.463'],
        strokeWidth,
        attr
    );
export const listNumbers = (strokeWidth = 2, attr = {}) =>
    renderIcon(['M11 6h9', 'M11 12h9', 'M12 18h8', 'M4 16a2 2 0 1 1 4 0c0 .591 -.5 1 -1 1.5l-3 2.5h4', 'M6 10v-6l-2 2'], strokeWidth, attr);
export const photo = (strokeWidth = 2, attr = {}) =>
    renderIcon(
        [
            'M15 8h.01',
            'M3 6a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v12a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3v-12',
            'M3 16l5 -5c.928 -.893 2.072 -.893 3 0l5 5',
            'M14 14l1 -1c.928 -.893 2.072 -.893 3 0l3 3',
        ],
        strokeWidth,
        attr
    );
export const sourceCode = (strokeWidth = 2, attr = {}) =>
    renderIcon(['M14.5 4h2.5a3 3 0 0 1 3 3v10a3 3 0 0 1 -3 3h-10a3 3 0 0 1 -3 -3v-5', 'M6 5l-2 2l2 2', 'M10 9l2 -2l-2 -2'], strokeWidth, attr);
export const strikethrough = (strokeWidth = 2, attr = {}) =>
    renderIcon(['M5 12l14 0', 'M16 6.5a4 2 0 0 0 -4 -1.5h-1a3.5 3.5 0 0 0 0 7h2a3.5 3.5 0 0 1 0 7h-1.5a4 2 0 0 1 -4 -1.5'], strokeWidth, attr);
