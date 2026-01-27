declare module 'hnb-auth-ui' {
    import { FC } from 'react';

    interface HNBAuthProps {
        backendUrl: string;
        redirectUri?: string;
        theme?: 'light' | 'dark';
    }

    export const HNBAuth: FC<HNBAuthProps>;
}
