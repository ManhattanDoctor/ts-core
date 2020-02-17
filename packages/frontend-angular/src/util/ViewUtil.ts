import { Renderer2 } from '@angular/core';
import { ObjectUtil } from '@ts-core/common/util';
import * as _ from 'lodash';

export class ViewUtil {
    // --------------------------------------------------------------------------
    //
    //	Constants
    //
    // --------------------------------------------------------------------------

    private static RENDERER: Renderer2 = null;

    // --------------------------------------------------------------------------
    //
    //	Private Methods
    //
    // --------------------------------------------------------------------------

    private static copyToClipboard(): void {
        try {
            document.execCommand('copy');
        } catch (error) {}
    }

    // --------------------------------------------------------------------------
    //
    //	Common Properties
    //
    // --------------------------------------------------------------------------

    public static initialize(renderer: Renderer2): void {
        ViewUtil.RENDERER = renderer;
    }

    public static parseElement(element: any): HTMLElement {
        if (element instanceof HTMLElement) {
            return element;
        }
        return ObjectUtil.hasOwnProperty(element, 'nativeElement') ? element.nativeElement : null;
    }

    public static createBase64(element: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement): string {
        let value = null;
        let canvas = ViewUtil.createElement('canvas');
        ViewUtil.setProperty(canvas, 'width', element.offsetWidth);
        ViewUtil.setProperty(canvas, 'height', element.offsetHeight);

        try {
            let context = canvas.getContext('2d');
            context.drawImage(element, 0, 0, element.offsetWidth, element.offsetHeight);
            value = canvas.toDataURL('image/jpeg', 1.0);
            value = value.replace('data:image/jpeg;base64,', '');
        } catch (error) {}
        return value;
    }

    public static selectContent(container: HTMLElement, isNeedCopyToClipboard: boolean = false): void {
        if (container instanceof HTMLInputElement || container instanceof HTMLTextAreaElement) {
            let isWasDisabled = container.disabled;
            if (isWasDisabled) {
                container.disabled = false;
            }
            container.select();
            if (isNeedCopyToClipboard) {
                ViewUtil.copyToClipboard();
            }
            if (isWasDisabled) {
                container.disabled = true;
            }
        } else {
            let selection = window.getSelection();
            selection.removeAllRanges();

            let range = document.createRange();
            if (!_.isNil(container)) {
                range.selectNodeContents(container);
            }
            selection.addRange(range);

            if (isNeedCopyToClipboard) {
                ViewUtil.copyToClipboard();
            }
        }
    }

    public static setBackground(container: HTMLElement, value: string, repeat: string = 'repeat'): void {
        if (!value) {
            ViewUtil.setStyle(container, 'backgroundImage', 'none');
            ViewUtil.setStyle(container, 'backgroundRepeat', 'none');
            return;
        }

        if (value.indexOf('url(') === -1) {
            value = 'url(' + value + ')';
        }

        ViewUtil.setStyle(container, 'backgroundImage', value);
        ViewUtil.setStyle(container, 'backgroundRepeat', repeat);
    }

    // --------------------------------------------------------------------------
    //
    //	Child Methods
    //
    // --------------------------------------------------------------------------

    public static createElement(name: string, className?: string, innerHTML?: string): any {
        let element = ViewUtil.RENDERER.createElement(name);
        if (!_.isNil(name)) {
            ViewUtil.setProperty(element, 'className', className);
        }
        if (!_.isNil(innerHTML)) {
            ViewUtil.setProperty(element, 'innerHTML', innerHTML);
        }
        return element;
    }

    public static appendChild(parent: any, child: any): void {
        if (!_.isNil(parent) && !_.isNil(child) && !_.isNil(ViewUtil.RENDERER)) {
            ViewUtil.RENDERER.appendChild(parent, child);
        }
    }

    public static removeChild(parent: any, child: any): void {
        if (!_.isNil(parent) && !_.isNil(child) && !_.isNil(ViewUtil.RENDERER)) {
            ViewUtil.RENDERER.removeChild(parent, child);
        }
    }

    public static toggleChild(container: Node, child: Node, value: boolean): void {
        let isContains = container.contains(child);
        if (value && !isContains) {
            ViewUtil.appendChild(container, child);
        }
        if (!value && isContains) {
            ViewUtil.removeChild(container, child);
        }
    }

    // --------------------------------------------------------------------------
    //
    //	Size Methods
    //
    // --------------------------------------------------------------------------

    public static getStageWidth(): number {
        return window.innerWidth || document.body.clientWidth;
    }

    public static getStageHeight(): number {
        return window.innerHeight || document.body.clientHeight;
    }

    public static getWidth(container: HTMLElement): number {
        if (_.isNil(container)) {
            return NaN;
        }
        let value = parseFloat(ViewUtil.getStyle(container, 'width'));
        if (_.isNaN(value)) {
            value = container.offsetWidth;
        }
        return value;
    }

    public static setWidth(container: HTMLElement, value: number, isNeedCheckLimits: boolean): boolean {
        if (_.isNil(container) || _.isNaN(value)) {
            return false;
        }

        if (isNeedCheckLimits && (value < ViewUtil.getMinWidth(container) || value > ViewUtil.getMaxWidth(container) || value === ViewUtil.getWidth(container)))
            return false;

        container.style.width = '540px';
        ViewUtil.setStyle(container, 'width', value + 'px');
        return true;
    }

    public static getMaxWidth(container: HTMLElement): number {
        if (_.isNil(container)) {
            return NaN;
        }

        let value = parseFloat(ViewUtil.getStyle(container, 'maxWidth'));
        if (_.isNaN(value)) {
            value = Number.POSITIVE_INFINITY;
        }
        return value;
    }

    public static getMinWidth(container: HTMLElement): number {
        if (_.isNil(container)) {
            return NaN;
        }

        let value = parseFloat(ViewUtil.getStyle(container, 'minWidth'));
        if (_.isNaN(value)) {
            value = 0;
        }
        return value;
    }

    public static getHeight(container: HTMLElement): number {
        if (_.isNil(container)) {
            return NaN;
        }

        let value = parseFloat(ViewUtil.getStyle(container, 'height'));
        if (_.isNaN(value)) {
            value = container.offsetHeight;
        }
        return value;
    }
    public static setHeight(container: HTMLElement, value: number, isNeedCheckLimits: boolean): boolean {
        if (_.isNil(container) || _.isNaN(value)) {
            return false;
        }

        if (
            isNeedCheckLimits &&
            (value < ViewUtil.getMinHeight(container) || value > ViewUtil.getMaxHeight(container) || value === ViewUtil.getHeight(container))
        )
            return false;

        ViewUtil.setStyle(container, 'height', value + 'px');
        return true;
    }
    public static getMaxHeight(container: HTMLElement): number {
        if (_.isNil(container)) {
            return NaN;
        }

        let value = parseFloat(ViewUtil.getStyle(container, 'maxHeight'));
        if (_.isNaN(value)) {
            value = Number.POSITIVE_INFINITY;
        }
        return value;
    }
    public static getMinHeight(container: HTMLElement): number {
        if (_.isNil(container)) {
            return NaN;
        }

        let value = parseFloat(ViewUtil.getStyle(container, 'minHeight'));
        if (isNaN(value)) {
            value = 0;
        }
        return value;
    }

    public static size(container: HTMLElement, width: number, height: number, isNeedCheckLimits: boolean): void {
        ViewUtil.setWidth(container, width, isNeedCheckLimits);
        ViewUtil.setHeight(container, height, isNeedCheckLimits);
    }

    public static getX(container: HTMLElement): number {
        if (_.isNil(container)) {
            return NaN;
        }
        let value = parseFloat(ViewUtil.getStyle(container, 'left'));
        return _.isNaN(value) ? 0 : value;
    }

    public static setX(container: HTMLElement, value: number): void {
        if (!_.isNil(container) && !_.isNaN(value)) {
            ViewUtil.setStyle(container, 'left', value + 'px');
        }
    }

    public static getY(container: HTMLElement): number {
        if (_.isNil(container)) {
            return NaN;
        }

        let value = parseFloat(ViewUtil.getStyle(container, 'top'));
        return _.isNaN(value) ? 0 : value;
    }
    public static setY(container: HTMLElement, value: number): void {
        if (!_.isNil(container) && !_.isNaN(value)) {
            ViewUtil.setStyle(container, 'top', value + 'px');
        }
    }
    public static move(container: HTMLElement, x: number, y: number): void {
        ViewUtil.setX(container, x);
        ViewUtil.setY(container, y);
    }

    // --------------------------------------------------------------------------
    //
    //	Focus Methods
    //
    // --------------------------------------------------------------------------

    public static focusInput(input: HTMLInputElement | HTMLTextAreaElement): void {
        let caretIndex = 0;
        if (!_.isNil(input.value)) {
            caretIndex = Math.max(0, input.value.toString().length);
        }
        input.focus();
        input.setSelectionRange(caretIndex, caretIndex);
    }

    // --------------------------------------------------------------------------
    //
    //	Classes Methods
    //
    // --------------------------------------------------------------------------

    public static addClass(container: any, name: string): void {
        if (_.isNil(name)) {
            return;
        }
        container = ViewUtil.parseElement(container);
        if (!_.isNil(container) && !_.isNil(ViewUtil.RENDERER)) {
            ViewUtil.RENDERER.addClass(container, name);
        }
    }

    public static addClasses(container: any, names: string): void {
        if (_.isEmpty(names)) {
            return;
        }
        names.split(' ').forEach(name => ViewUtil.addClass(container, name));
    }

    public static removeClass(container: any, name: string): void {
        if (_.isNil(name)) {
            return;
        }
        container = ViewUtil.parseElement(container);
        if (!_.isNil(container) && !_.isNil(ViewUtil.RENDERER)) {
            ViewUtil.RENDERER.removeClass(container, name);
        }
    }

    public static removeClasses(container: any, names: string): void {
        if (_.isEmpty(names)) {
            return;
        }
        names.split(' ').forEach(name => ViewUtil.removeClass(container, name));
    }

    public static hasClass(container: any, name: string): boolean {
        if (_.isNil(name)) {
            return false;
        }
        container = ViewUtil.parseElement(container);
        return !_.isNil(container) ? container.classList.contains(name) : false;
    }

    public static toggleClass(container: any, name: string, value: boolean): void {
        if (value) {
            ViewUtil.addClass(container, name);
        } else {
            ViewUtil.removeClass(container, name);
        }
    }

    public static getProperty(container: any, name: string): any {
        if (_.isNil(name)) {
            return null;
        }
        container = ViewUtil.parseElement(container);
        return !_.isNil(container) ? container[name] : null;
    }

    public static setProperty(container: any, name: string, value: any): void {
        if (_.isNil(name)) {
            return;
        }

        container = ViewUtil.parseElement(container);
        if (!_.isNil(container) && !_.isNil(ViewUtil.RENDERER)) {
            ViewUtil.RENDERER.setProperty(container, name, value);
        }
    }

    public static removeProperty(container: any, name: string): void {
        ViewUtil.removeAttribute(container, name);
    }

    public static removeAttribute(container: any, name: string): void {
        if (_.isNil(name)) {
            return;
        }
        container = ViewUtil.parseElement(container);
        if (!_.isNil(container) && !_.isNil(ViewUtil.RENDERER)) {
            ViewUtil.RENDERER.removeAttribute(container, name);
        }
    }

    public static setAttribute(container: any, name: string, value: any): void {
        if (_.isNil(name)) {
            return;
        }
        container = ViewUtil.parseElement(container);
        if (!_.isNil(container) && !_.isNil(ViewUtil.RENDERER)) {
            ViewUtil.RENDERER.setAttribute(container, name, value);
        }
    }

    public static getStyle(container: any, name: string): any {
        if (_.isNil(name)) {
            return null;
        }
        container = ViewUtil.parseElement(container);
        return !_.isNil(container) ? container.style[name] : null;
    }

    public static setStyle(container: any, name: string, value: any): void {
        if (_.isNil(name)) {
            return;
        }
        container = ViewUtil.parseElement(container);
        if (!_.isNil(container) && !_.isNil(ViewUtil.RENDERER)) {
            ViewUtil.RENDERER.setStyle(container, name, value);
        }
    }

    public static removeStyle(container: any, name: string): void {
        if (_.isNil(name)) {
            return;
        }
        container = ViewUtil.parseElement(container);
        if (!_.isNil(container) && !_.isNil(ViewUtil.RENDERER)) {
            ViewUtil.RENDERER.removeStyle(container, name);
        }
    }

    // --------------------------------------------------------------------------
    //
    //	Video Methods
    //
    // --------------------------------------------------------------------------

    public static createVideo(isMute: boolean = true, isInline: boolean = false): HTMLVideoElement {
        let video = ViewUtil.createElement('video');
        ViewUtil.setProperty(video, 'autoplay', true);
        if (isMute) {
            ViewUtil.setVideoMuteParameters(video, isMute);
        }
        if (isInline) {
            ViewUtil.setVideoInlineParameters(video);
        }
        return video;
    }

    public static setVideoMuteParameters(video: HTMLVideoElement, isMute: boolean = true): void {
        if (!_.isNil(video)) {
            video.muted = video.defaultMuted = isMute;
        }
    }

    public static setVideoInlineParameters(video: HTMLVideoElement): void {
        ViewUtil.setAttribute(video, 'webkit-playsinline', 1);
        ViewUtil.setAttribute(video, 'playsinline', true);
    }

    public static getVideoError(video: HTMLVideoElement): string {
        if (_.isNil(video) || _.isNil(video.error)) {
            return null;
        }

        let error: MediaError = video.error;
        let value = 'Video error ' + video.src + ', ';
        switch (error.code) {
            case MediaError.MEDIA_ERR_ABORTED:
                value += 'media aborted';
                break;
            case MediaError.MEDIA_ERR_DECODE:
                value += 'error to decode';
                break;
            case MediaError.MEDIA_ERR_NETWORK:
                value += 'network error';
                break;
            case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
                value += 'source not supported';
                break;
        }
        return value;
    }

    public static playVideo(video: HTMLVideoElement): Promise<void> {
        if (_.isNil(video)) {
            return;
        }

        try {
            return video.play();
        } catch (error) {
            return Promise.reject(error);
        }
    }

    public static playAudio(audio: HTMLAudioElement): Promise<void> {
        if (_.isNil(audio)) {
            return null;
        }
        try {
            return audio.play();
        } catch (error) {
            return Promise.reject(error);
        }
    }

    public static pauseVideo(video: HTMLVideoElement): void {
        if (!_.isNil(video)) {
            video.pause();
        }
    }

    public static isVideoPlaying(video: HTMLVideoElement): boolean {
        return !_.isNil(video) ? !video.paused && !video.ended : false;
    }

    public static loadVideo(video: HTMLVideoElement): void {
        if (!_.isNil(video)) {
            video.load();
        }
    }

    public static stopVideoIfNeed(video: HTMLVideoElement): void {
        if (!_.isNil(video) && (!_.isNil(video.src) || !_.isNil(video.srcObject))) {
            ViewUtil.stopVideo(video);
        }
    }

    public static stopVideo(video: HTMLVideoElement): void {
        if (_.isNil(video)) {
            return;
        }

        if (video.srcObject instanceof MediaStream) {
            let tracks = video.srcObject.getTracks();
            tracks.forEach(track => track.stop());
        }

        video.srcObject = null;

        video.pause();
        video.src = '';
        video.load();
    }

    public static disposeVideo(video: HTMLVideoElement): void {
        ViewUtil.stopVideo(video);
        ViewUtil.removeChild(video.parentNode, video);
        video.remove();
    }

    public static disposeVideos(container: HTMLElement): void {
        for (let i = container.children.length - 1; i >= 0; i--) {
            let item = container.children.item(i);
            if (item instanceof HTMLVideoElement) {
                ViewUtil.disposeVideo(item);
            }
        }
    }

    // --------------------------------------------------------------------------
    //
    //	Object Methods
    //
    // --------------------------------------------------------------------------

    public static disposeObjects(container: HTMLElement, isIEBrowser?: boolean): void {
        for (let i = container.children.length - 1; i >= 0; i--) {
            let item = container.children.item(i);
            if (item instanceof HTMLObjectElement) {
                ViewUtil.disposeObject(item, isIEBrowser);
            }
        }
    }

    public static disposeObject(object: HTMLObjectElement, isIEBrowser?: boolean): void {
        if (isIEBrowser && object['readyState'] === 4) {
            for (let i in object) {
                if (_.isFunction(object[i])) {
                    object[i] = null;
                }
            }
        }
        ViewUtil.removeChild(object.parentNode, object);
    }
}
