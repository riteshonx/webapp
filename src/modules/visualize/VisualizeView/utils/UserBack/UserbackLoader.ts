import { UserbackWidget } from "./UserBackDef";

export const USERBACK_SCRIPT_ID = 'USERBACK_SCRIPT';

export function Userback(token: string) {
    return new Promise<UserbackWidget>((resolve) => {
        if (Boolean(window.Userback)) {
            resolve(window.Userback!);
            return;
        }

        const script = document.createElement('script');
        script.id = USERBACK_SCRIPT_ID;
        script.src = `https://static.userback.io/widget/v1.js`;
        script.async = true;
        script.onload = () => onScriptLoad(token, resolve, script);
        script.onerror = (err) => console.log('Userback was unable to load', err);
        document.body.appendChild(script);
    });
}

function onScriptLoad(token: string, resolve: (value: UserbackWidget | PromiseLike<UserbackWidget>) => void, script: HTMLScriptElement) {
    if (typeof window.Userback === 'undefined') {
        return;
    }

    window.Userback.init(token);
    window.Userback.removeFromDom = () => removeFromDom(script);
    return resolve(window.Userback!);
}

function removeFromDom(script: HTMLScriptElement) {
    window.Userback?.destroy();
    window.Userback = undefined;
    document.body.removeChild(script);
}