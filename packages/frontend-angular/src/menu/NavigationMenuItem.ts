import { MenuItem } from './MenuItem';

export class NavigationMenuItem extends MenuItem {
    // --------------------------------------------------------------------------
    //
    // 	Properties
    //
    // --------------------------------------------------------------------------

    public url: string;
    public isActive: boolean = false;
    public select: (item: NavigationMenuItem) => void;

    // --------------------------------------------------------------------------
    //
    // 	Constructor
    //
    // --------------------------------------------------------------------------

    constructor(nameId?: string, sortIndex?: number, iconId?: string, url?: string) {
        super(nameId, sortIndex, null, iconId);
        this.url = url;
    }
}
