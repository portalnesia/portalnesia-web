import React from "react";
import { isIOS, isSafari } from "react-device-detect";

const longPressDuration = 610;

export type CallbackEvent<E extends HTMLElement> = React.MouseEvent<E> | React.TouchEvent<E>;
export default class ContextMenuHandler<E extends HTMLElement> {
    private callback: (e: CallbackEvent<E>) => void;
    private longPressCountdown: NodeJS.Timeout | null = null;
    private contextMenuPossible = false;

    constructor(callback: (e: CallbackEvent<E>) => void) {
        this.callback = callback;
    }

    private clearTimeout = () => {
        if (this.longPressCountdown) {
            clearTimeout(this.longPressCountdown);
            this.longPressCountdown = null;
        }
    }

    onTouchStart = (e: React.TouchEvent<E>) => {
        if (isSafari && isIOS) {
            this.contextMenuPossible = true;

            this.longPressCountdown = setTimeout(() => {
                this.contextMenuPossible = false;
                this.callback(e);
            }, longPressDuration);
        }
    };

    onTouchMove = () => {
        this.clearTimeout();
    };

    onTouchCancel = (e: React.TouchEvent<E>) => {
        this.contextMenuPossible = false;
        this.clearTimeout();
    };

    onTouchEnd = (e: React.TouchEvent<E>) => {
        this.contextMenuPossible = false;
        this.clearTimeout();
    };

    onContextMenu = (e: React.MouseEvent<E>) => {
        this.contextMenuPossible = false;

        this.clearTimeout();

        this.callback(e);
        e.preventDefault();
    };
}
