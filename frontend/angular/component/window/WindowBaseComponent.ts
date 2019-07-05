import { ComponentFactoryResolver, ComponentRef } from '@angular/core';
import { APPLICATION_INJECTOR } from '../../ApplicationInjector';
import { ViewUtil } from '../../util';
import { CloseWindowElementComponent } from './close-window-element/close-window-element.component';
import { MinimizeWindowElementComponent } from './minimize-window-element/minimize-window-element.component';
import { ResizeWindowElementComponent } from './resize-window-element/resize-window-element.component';
import { WindowDragable } from './WindowDragable';
import { WindowElement } from './WindowElement';

export class WindowBaseComponent extends WindowDragable {
    //--------------------------------------------------------------------------
    //
    //  Static Properties
    //
    //--------------------------------------------------------------------------

    public static CLOSE_WINDOW_COMPONENT = CloseWindowElementComponent;
    public static RESIZE_WINDOW_COMPONENT = ResizeWindowElementComponent;
    public static MINIMIZE_WINDOW_COMPONENT = MinimizeWindowElementComponent;

    //--------------------------------------------------------------------------
    //
    //  Properties Methods
    //
    //--------------------------------------------------------------------------

    protected closeWindow: ComponentRef<any>;
    protected resizedWindow: ComponentRef<any>;
    protected minimizeWindow: ComponentRef<any>;

    //--------------------------------------------------------------------------
    //
    //  Private Methods
    //
    //--------------------------------------------------------------------------

    private setWindowElementProperties(item: WindowElement): void {
        this.addDestroyable(item);
    }

    //--------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    //--------------------------------------------------------------------------

    protected setProperties(): void {
        super.setProperties();

        if (!this.config.disableClose && !this.closeWindow) {
            let factory = this.resolver.resolveComponentFactory(WindowBaseComponent.CLOSE_WINDOW_COMPONENT);
            this.closeWindow = this.content.container.createComponent(factory);
            this.closeWindow.instance.window = this;
        }

        if (this.config.isResizeable && !this.resizedWindow) {
            let factory = this.resolver.resolveComponentFactory(WindowBaseComponent.RESIZE_WINDOW_COMPONENT);
            this.resizedWindow = this.content.container.createComponent(factory);
            this.resizedWindow.instance.window = this;
        }

        if (this.config.isMinimizable && !this.minimizeWindow) {
            let factory = this.resolver.resolveComponentFactory(WindowBaseComponent.MINIMIZE_WINDOW_COMPONENT);
            this.minimizeWindow = this.content.container.createComponent(factory);
            this.minimizeWindow.instance.window = this;
        }
    }

    protected commitIsBlinkProperties(): void {
        ViewUtil.toggleClass(this.container, 'blink', this.isBlink);
    }

    protected commitIsShakingProperties(): void {
        ViewUtil.toggleClass(this.container, 'shake-constant', this.isShaking);
        ViewUtil.toggleClass(this.container, 'shake-horizontal', this.isShaking);
    }

    protected commitIsMinimizedProperties(): void {
        ViewUtil.toggleClass(this.container, 'minimized', this.isMinimized);
        ViewUtil.toggleClass(this.content.element, 'minimized', this.isMinimized);
        ViewUtil.toggleClass(this.content.element.nativeElement.parentElement, 'minimized', this.isMinimized);
    }

    protected isNeedClickStopPropagation(event: MouseEvent): boolean {
        if (!super.isNeedClickStopPropagation(event)) {
            return false;
        }
        if (this.closeWindow && this.closeWindow.location.nativeElement === event.target) {
            return false;
        }
        return true;
    }

    //--------------------------------------------------------------------------
    //
    //  Protected Properties
    //
    //--------------------------------------------------------------------------

    protected get resolver(): ComponentFactoryResolver {
        return APPLICATION_INJECTOR().get(ComponentFactoryResolver);
    }

    //--------------------------------------------------------------------------
    //
    //  Public Methods
    //
    //--------------------------------------------------------------------------

    public destroy(): void {
        super.destroy();
        // Components will destroy automatically
        this.closeWindow = null;
        this.resizedWindow = null;
        this.minimizeWindow = null;
    }
}
