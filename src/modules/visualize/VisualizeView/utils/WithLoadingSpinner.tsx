import { styled } from '@mui/system';
import { ReactNode } from 'react';

import { LoadingSpinner } from './LoadingSpinner';

interface WithLoadingSpinnerProps {
    loading: boolean;
    children: ReactNode | ReactNode[];
    overlay?: boolean;
}

const OverlayedLoadingSpinnerContainer = styled('div')({
    position: 'absolute',
    height: '100%',
    width: '100%',
    zIndex: 10,
});

const NonOverlayedLoadingSpinnerContainer = styled('div')({
    position: 'absolute',
    height: '100%',
    width: '100%',
    zIndex: 10,
    background: 'white',
});

export function WithLoadingSpinner({loading, children, overlay}: WithLoadingSpinnerProps) {
    return (
        <>
            {children}

            {
                loading && overlay && 
                    <OverlayedLoadingSpinnerContainer>
                        <LoadingSpinner />
                    </OverlayedLoadingSpinnerContainer>
            }

            {
                loading && !overlay && 
                    <NonOverlayedLoadingSpinnerContainer>
                        <LoadingSpinner />
                    </NonOverlayedLoadingSpinnerContainer>
            }
        </>
    )
}