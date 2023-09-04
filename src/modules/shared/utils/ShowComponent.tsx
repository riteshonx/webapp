import { ReactNode } from "react";

interface Props {
    children: ReactNode;
    showState: boolean;
}
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function ShowComponent ({ children, showState }: Props) {
    if (showState) return <>{children}</>;
    return <></>;
}
