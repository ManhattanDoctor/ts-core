import { ITransportSettings } from '@ts-core/common/transport';
import { IAmqpSettings } from '../settings';

export interface ITransportAmqpSettings extends IAmqpSettings, ITransportSettings {}
