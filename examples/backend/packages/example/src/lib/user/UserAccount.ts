import { IsEnum } from 'class-validator';

export enum UserAccountType {
    ROOT = 'ROOT',
    ADMINISTRATOR = 'ADMINISTRATOR',
}

export class UserAccount {
    @IsEnum(UserAccountType)
    type: UserAccountType;
}
