import { MenuItemBase } from './MenuItemBase';

export class MenuItem extends MenuItemBase {
    // --------------------------------------------------------------------------
    //
    // 	Properties
    //
    // --------------------------------------------------------------------------

    public flag: string;
    public select: (item: MenuItem) => void;

    // --------------------------------------------------------------------------
    //
    // 	Constructor
    //
    // --------------------------------------------------------------------------

    constructor(nameId?: string, sortIndex?: number, flag?: string, iconId?: string) {
        super(nameId, sortIndex, iconId);
        this.flag = flag || 'none';
    }
}
