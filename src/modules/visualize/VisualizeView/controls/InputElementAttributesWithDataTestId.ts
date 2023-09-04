import { InputHTMLAttributes } from 'react';

export interface InputElementAttributesWithDataTestId extends InputHTMLAttributes<HTMLInputElement> {
    'data-testid'?: string;
}