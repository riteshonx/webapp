import { createTheme, Theme as MuiTheme, ThemeOptions } from '@mui/material/styles';
import { ThemeProvider } from '@mui/system';
import { ReactNode, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { stateContext } from '../root/context/authentication/authContext';
import { useEventListener } from './VisualizeView/utils/useEventListener';

const onxA4 = '#757575';
const onxA5 = '#9E9E9E';
const onxA6 = '#BDBDBD';

const red= '#D02F2F';
const blue = '#07676E';
const statusRed = '#E5393580';
const statusGreen = '#A8D7A9';
const statusOrange = '#FFCA6A';
const statusGrey = '#B6B6B6';

// Model Highlighting Colors
const defaultHighlightBlue = 0x007BFF;
const highlightRed = '#E53935';
const highlightGrey = '#B6B6B6';
const highlightGreen = '#A8D7A9';
const highlightOrange = '#d8d874';
const highlightReady = '#7A77D9';

const lightGrey = onxA6;
const mediumGrey = onxA5;
const darkGrey = onxA4;
const blueColor = blue;
const openStatusColor = statusRed;
const closedStatusColor = statusGreen;
const notFoundStatusColor = statusGrey;
const mixedStatusColor = statusOrange;
export const modelHighlightDefaultColor = defaultHighlightBlue;
export const modelHighlightOpenColor = highlightRed;
export const modelHighlightClosedColor = highlightGreen;
export const modelHighlightMixedColor = highlightOrange;
export const modelHighlightReadyColor = highlightReady;


interface ExtendedThemeOptions extends ThemeOptions {
    navMenuWidth: number;
    windowHeight: number;

    colors: {
        lightGrey: React.CSSProperties['color'];
        mediumGrey: React.CSSProperties['color'];
        darkGrey: React.CSSProperties['color'];
        red: React.CSSProperties['color'];
        blueColor: React.CSSProperties['color'];
        openStatusColor: React.CSSProperties['color'];
        closedStatusColor: React.CSSProperties['color'];
        notFoundStatusColor: React.CSSProperties['color'];
        mixedStatusColor: React.CSSProperties['color'];
        modelHighlightDefaultColor: number;
        modelHighlightOpenColor: React.CSSProperties['color'];
        modelHighlightClosedColor: React.CSSProperties['color'];
        modelHighlightMixedColor: React.CSSProperties['color'];
    },

    breakpoints: {
        values: {
            xs: number;
            sm: number;
            md: number;
            lg: number;
            xl: number;
        },
    },
}

const themeOptions = (navMenuWidth: number, windowHeight: number) => ({
    navMenuWidth,
    windowHeight,

    colors: {
        lightGrey,
        mediumGrey,
        darkGrey,
        red,
        blueColor,
        openStatusColor,
        closedStatusColor,
        notFoundStatusColor,
        mixedStatusColor,
        modelHighlightDefaultColor,
        modelHighlightOpenColor,
        modelHighlightClosedColor,
        modelHighlightMixedColor,
    },

    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    fontFamily: '"Poppins", sans-serif',
                }
            }
        },
    },

    breakpoints: {
        values: {
            xs: 0,
            sm: 1025,
            md: 1111,
            lg: 1200,
            xl: 1536,
        }
    }
} as ExtendedThemeOptions);

export interface Theme extends MuiTheme {
    navMenuWidth: number,
    windowHeight: number,
    colors: {
        lightGrey: React.CSSProperties['color'];
        mediumGrey: React.CSSProperties['color'];
        darkGrey: React.CSSProperties['color'];
        red: React.CSSProperties['color'];
        blueColor: React.CSSProperties['color'];
        openStatusColor: React.CSSProperties['color'];
        closedStatusColor: React.CSSProperties['color'];
        notFoundStatusColor: React.CSSProperties['color'];
        mixedStatusColor: React.CSSProperties['color'];
        modelHighlightDefaultColor: number;
        modelHighlightOpenColor: React.CSSProperties['color'];
        modelHighlightClosedColor: React.CSSProperties['color'];
        modelHighlightMixedColor: React.CSSProperties['color'];
    }
}

const navDrawerWidth = 72;

interface LocationIntelligenceThemeProviderProps {
    children: ReactNode | ReactNode[];
}

export function LocationIntelligenceThemeProvider({children}: LocationIntelligenceThemeProviderProps) {
    const htmlRef = useRef<HTMLElement>();
    const mainRef = useRef<HTMLElement>();
    const {state: navMenuState} = useContext(stateContext);
    const isDrawerOpen = !navMenuState.isDrawerOpen; // This global state is inverted so I un-invert it here.

    const navMenuWidth = useMemo(() => isDrawerOpen ? navDrawerWidth : 0, [isDrawerOpen]);

    const [windowHeight, setWindowHeight] = useState<number>(window.innerHeight);

    function onWindowResize(event: any) {
        setWindowHeight(window.innerHeight);
    }

    useEventListener('resize', onWindowResize);

    const theme = useMemo(() => {
        const _themeOptions = themeOptions(navMenuWidth, windowHeight);
        return createTheme(_themeOptions);
    }, [navMenuWidth, windowHeight]);

    // The following use effect is to prevent whole page scrolling in safari on mobile.
    // The following will prevent any scrolling of the html element while on the visualize page.
    // Safari on mobile will treat vh incorrectly (hence the windowHeight field above).
    // The rest of the app currently is relying on vh which is making the body too big in safari mobile and causing a large scroll
    // effect to be present.
    // The main cause of this bug in tablets appears to be that safari on mobile does not treat vh the way you would expect
    // The solution is to just force it to be the proper height via the windows height.

    // TODO - fix vh use in rest of app to prevent the ability to scroll the body of the page at all.
    useEffect(() => {
        htmlRef.current = document.documentElement;
        htmlRef.current.style.overflow = 'hidden';
        htmlRef.current.scrollTop = 0;
        htmlRef.current.style.height = `${windowHeight}px`;

        mainRef.current = document.getElementsByTagName('main')[0];
        mainRef.current!.style.overflow = 'hidden';
        mainRef.current!.scrollTop = 0;
        mainRef.current!.style.height = `${windowHeight - 54}px`;

        return () => {
            htmlRef.current!.style.overflow = '';
            htmlRef.current!.style.height = '';
            mainRef.current!.style.overflow = '';
            mainRef.current!.style.height = '';
        }
    }, [windowHeight]);
    
    return (
        <ThemeProvider theme={theme}>
            {children}
        </ThemeProvider>
    )
}