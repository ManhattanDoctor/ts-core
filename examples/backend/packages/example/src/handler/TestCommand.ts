import { TransportCommandFabricAsync } from '@ts-core/blockchain-fabric/transport/command';
import { ITraceable } from '@ts-core/common/trace';
import { IsString, IsNumber } from 'class-validator';
import { TransformUtil } from '@ts-core/common/util';

export class UserAddCommand extends TransportCommandFabricAsync<IUserAddDto, IUserAddDtoResponse> {

    public static readonly NAME = 'UserAdd';

    constructor(request: IUserAddDto) {
        super(UserAddCommand.NAME, TransformUtil.toClass(UserAddDto, request));
    }

    protected checkResponse(response: IUserAddDtoResponse): IUserAddDtoResponse {
        return TransformUtil.toClass(UserAddDtoResponse, response);
    }
}

export interface IUserAddDto extends ITraceable {
    name: string;
    age: number;
}

export interface IUserAddDtoResponse extends ITraceable {
    id: string;
}

class UserAddDto implements IUserAddDto {
    @IsString()
    name: string;
    @IsNumber()
    age: number;
}

class UserAddDtoResponse implements IUserAddDtoResponse {
    @IsString()
    id: string;
}
