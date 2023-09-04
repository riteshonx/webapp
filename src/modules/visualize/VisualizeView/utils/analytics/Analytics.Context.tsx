import mixpanel from 'mixpanel-browser';
import { createContext, MutableRefObject, ReactNode, useContext, useEffect, useRef, useState } from 'react';

import { useProjectId } from '../../hooks/useProjectId';
import { UserDetail } from '../UserDetail';
import { useUserDetailContext } from '../UserDetail/UserDetail.Context';

const token = '741c989c7c286b75b3ff1db1f09bd122';

type TrackingEvents = 'Opened-Visualize' |
    'Closed-Visualize' |
    'Loaded-Visualize' |
    'Project-Loaded' |
    'Environment-Loaded' |
    'Visualize-Smart-Project-Loaded' |
    'Visualize-Forms-Loaded' |
    'Visualize-Project-Tree-Loaded' |
    'Form-Types-Selector-Opened' |
    'Form-Types-Selected' |
    'Form-Types-Selector-Closed' |
    'Form-Selected' |
    'Form-Link-Clicked' |
    NodeTrackingEvents;

export type NodeTrackingEvents = 'Selected-Map-Node-Changed' |
    'Selected-Viewer-Node-Changed' |
    'Exterior-Selected' |
    'Node-Selected-In-Viewer' |
    'Node-Selected-In-Map-Nav' |
    'Node-Selected-By-Form' |
    'Node-Selected-By-Form-Back-Button' |
    'Node-Selected-By-Form-Being-Unset' |
    'Node-Unselected-By-Form-Back-Button';

export interface AnalyticsContextObject {
    track: (eventName: TrackingEvents, body?: any) => void;
    timeEvent: (eventName: TrackingEvents) => void;
    loaded: boolean;
    loadedRef: MutableRefObject<boolean>;
}

export const AnalyticsContext = createContext<AnalyticsContextObject>({} as AnalyticsContextObject);

export function useAnalytics(): AnalyticsContextObject {
    return useContext(AnalyticsContext);
}

interface AnalyticsProviderProps {
    children: ReactNode | ReactNode[];
}

export function AnalyticsProvider({children}: AnalyticsProviderProps) {
    const loadedRef = useRef<boolean>(false);
    const [loaded, setLoaded] = useState<boolean>(false);

    const projectId = useProjectId();
    const {userDetail} = useUserDetailContext();

    useEffect(() => {
        mixpanel.init(token);
        loadedRef.current = true;
        setLoaded(true);

        timeEvent('Closed-Visualize');
        track('Opened-Visualize');
        track('Environment-Loaded', {environment: process.env['REACT_APP_ENVIRONMENT']});
        window.addEventListener('beforeunload', onUnload);

        return () => {
            onUnload();
            window.removeEventListener('beforeunload', onUnload);
        }
    }, []);

    useEffect(() => {
        if (Boolean(userDetail)) {
            setUserProfileInMixpanel(userDetail!);
        }
    }, [userDetail]);

    useEffect(() => {
        if (Boolean(projectId)) {
            track('Project-Loaded', {projectId: projectId});
        }
    }, [projectId]);

    function onUnload() {
        track('Closed-Visualize');
    }

    function setUserProfileInMixpanel(userDetail: UserDetail) {
        const {firstName, lastName, email, jobTitle} = userDetail;
        mixpanel.identify(userDetail.email);
        mixpanel.people.set({
            '$first_name': firstName,
            '$last_name': lastName,
            '$email': email,
            'jobTitle': jobTitle,
        });
    }

    function timeEvent(eventName: TrackingEvents) {
        mixpanel.time_event(eventName);
    }

    function track(eventName: TrackingEvents, body?: any) {
        const bodyWithEnvironment = {
            ...body,
            environment: process.env['REACT_APP_ENVIRONMENT'],
        }

        if (loadedRef.current) {
            mixpanel.track(eventName, bodyWithEnvironment);
        }
    }

    const analyticsContextObject: AnalyticsContextObject = {
        track,
        timeEvent,
        loaded,
        loadedRef
    }
    
    return (
        <AnalyticsContext.Provider value={analyticsContextObject}>
            {children}
        </AnalyticsContext.Provider>
    )
}