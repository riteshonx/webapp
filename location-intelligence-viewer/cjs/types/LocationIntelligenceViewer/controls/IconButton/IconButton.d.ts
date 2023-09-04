/// <reference types="react" />
export declare const IconButton: import("react").JSXElementConstructor<Omit<{
    children?: import("react").ReactNode;
    classes?: Partial<import("@mui/material").IconButtonClasses>;
    color?: "error" | "default" | "inherit" | "primary" | "secondary" | "info" | "success" | "warning";
    disabled?: boolean;
    disableFocusRipple?: boolean;
    edge?: false | "end" | "start";
    size?: "small" | "medium" | "large";
    sx?: import("@mui/material").SxProps<import("@mui/material").Theme>;
} & Omit<{
    action?: import("react").Ref<import("@mui/material").ButtonBaseActions>;
    centerRipple?: boolean;
    children?: import("react").ReactNode;
    classes?: Partial<import("@mui/material").ButtonBaseClasses>;
    disabled?: boolean;
    disableRipple?: boolean;
    disableTouchRipple?: boolean;
    focusRipple?: boolean;
    focusVisibleClassName?: string;
    LinkComponent?: import("react").ElementType<any>;
    onFocusVisible?: import("react").FocusEventHandler<any>;
    sx?: import("@mui/material").SxProps<import("@mui/material").Theme>;
    tabIndex?: number;
    TouchRippleProps?: Partial<import("@mui/material/ButtonBase/TouchRipple").TouchRippleProps>;
    touchRippleRef?: import("react").Ref<import("@mui/material/ButtonBase/TouchRipple").TouchRippleActions>;
}, "classes"> & import("@mui/material/OverridableComponent").CommonProps & Omit<Pick<import("react").DetailedHTMLProps<import("react").ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, "key" | keyof import("react").ButtonHTMLAttributes<HTMLButtonElement>> & {
    ref?: import("react").Ref<HTMLButtonElement>;
}, "size" | "color" | "disabled" | "children" | keyof import("@mui/material/OverridableComponent").CommonProps | "tabIndex" | "action" | "centerRipple" | "disableRipple" | "disableTouchRipple" | "focusRipple" | "focusVisibleClassName" | "LinkComponent" | "onFocusVisible" | "sx" | "TouchRippleProps" | "touchRippleRef" | "disableFocusRipple" | "edge">, "classes"> & import("@mui/styles").StyledComponentProps<"root"> & object>;
