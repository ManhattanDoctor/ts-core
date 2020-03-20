import { Exclude, Type } from 'class-transformer';
import { IsDate, IsDefined, IsString, ValidateNested } from 'class-validator';
import * as _ from 'lodash';
import { UserAccount } from './UserAccount';

export class User {
    // --------------------------------------------------------------------------
    //
    //  Static Methods
    //
    // --------------------------------------------------------------------------

    public static getUid(item: User | string): string {
        return !_.isNil(item) ? `user:${item instanceof User ? item.id : item}` : null;
    }

    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    @IsString()
    public id: string;

    @IsString()
    public publicKey: string;

    @Type(() => Date)
    @IsDate()
    public createdDate: Date;

    @Type(() => UserAccount)
    @IsDefined()
    @ValidateNested()
    public account: UserAccount;

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    @Exclude()
    public get uid(): string {
        return User.getUid(this);
    }
}
