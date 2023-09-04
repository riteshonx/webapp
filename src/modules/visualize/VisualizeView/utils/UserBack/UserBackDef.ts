export interface UserbackAfterSendData {
    load_type: string;
    domain: string;
    page: string;
    email: string;
    description: string;
    update_reporter: true;
    comments: any;
    attachment_file_name: string;
    user_agent: string;
    window_x: number;
    window_y: number;
    resolution_x: number;
    resolution_y: number;
    categories: string;
    custom_data: any;
    rating: string;
}
export interface UserbackFormSettings {
    rating_type?: 'star' | 'emoji' | 'heart' | 'thumb';
    rating_help_message?: string;
    name_field?: boolean;
    name_field_mandatory?: boolean;
    email_field?: boolean;
    email_field_mandatory?: boolean;
    title_field?: boolean;
    title_field_mandatory?: boolean;
    comment_field?: boolean;
    comment_field_mandatory?: boolean;
    display_category?: boolean;
    display_feedback?: boolean;
    display_attachment?: boolean;
    display_assignee?: boolean;
    display_priority?: boolean;
    main_button_text?: string;
    main_button_background_colour?: string;
    main_button_text_colour?: string;
}
export interface UserbackWidgetSettings {
    language?: 'en' | 'da' | 'de' | 'es' | 'et' | 'fi' | 'fr' | 'hu' | 'it' | 'jp' | 'ko' | 'lt' | 'pl' | 'pt' | 'pt-br' | 'nl' | 'no' | 'ro' | 'ru' | 'sk' | 'sv' | 'zh-CN' | 'zh-TW';
    style?: 'text' | 'circle';
    position?: string;
    trigger_type?: 'page_load' | 'api' | 'url_match';
    device_type?: 'desktop' | 'tablet' | 'phone';
    help_link?: string;
    help_title?: string;
    help_message?: string;
    logo?: string;
    form_settings?: {
        general?: UserbackFormSettings;
        bug?: UserbackFormSettings;
        feature_request?: UserbackFormSettings;
    };
}
export interface UserbackOptions {
    email?: string;
    name?: string;
    categories?: string;
    priority?: string;
    custom_data?: any;
    is_live?: boolean;
    widget_settings?: UserbackWidgetSettings;
    native_screenshot?: boolean;
    domain?: string;
    on_load?: () => void;
    on_open?: () => void;
    on_close?: () => void;
    before_send?: () => void;
    after_send?: (data: UserbackAfterSendData) => any;
    autohide?: boolean;
}
export declare type UserbackFeedbackType = 'general' | 'bug' | 'feature_request';
export declare type UserbackDestinationType = 'screenshot' | 'video' | 'form';
export interface UserbackFunctions {
    init: (token: string, options?: UserbackOptions) => Promise<UserbackWidget>;
    show: () => void;
    hide: () => void;
    open: (feedback_type?: UserbackFeedbackType, destination?: UserbackDestinationType) => void;
    close: () => void;
    destroy: () => void;
    removeFromDom: () => void;
    isLoaded: () => boolean;
    openPortal: () => void;
    setName: (name: string) => void;
    setEmail: (email: string) => void;
    setCategories: (categories: string) => void;
    setPriority: (priority: string) => void;
    identify: (user_id: string, user_info: any) => void;
    addHeader: (key: string, value: string) => void;
    /**
     * Reset custom data after JavaScript SDK is loaded.
     *
     * @param custom_data - A non-nested object containg custom metadata
     */
    setData: (custom_data: any) => void;
}
export interface UserbackWidget extends UserbackOptions, UserbackFunctions {
    access_token: string;
    request_url: string;
}

declare global {
    interface Window {
        Userback: UserbackWidget | undefined;
    }
}
