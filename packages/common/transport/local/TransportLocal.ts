import * as _ from 'lodash';
import { ExtendedError } from '../../error';
import { LoadableEvent } from '../../Loadable';
import { ObservableData } from '../../observer';
import { PromiseHandler } from '../../promise';
import { ITransportCommand, ITransportCommandAsync, ITransportCommandOptions, ITransportEvent } from '../ITransport';
import { Transport, TransportLogType } from '../Transport';

export class TransportLocal extends Transport {
    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public send<U>(command: ITransportCommand<U>, options?: ITransportCommandOptions): void {
        this.requestSend(command, this.getCommandOptions(command, options));
    }

    public sendListen<U, V>(command: ITransportCommandAsync<U, V>, options?: ITransportCommandOptions): Promise<V> {
        if (this.promises.has(command.id)) {
            return this.promises.get(command.id).handler.promise;
        }

        options = this.getCommandOptions(command, options);

        let handler = PromiseHandler.create<V, ExtendedError>();
        this.promises.set(command.id, { command, handler, options });
        this.requestSend(command, options);
        return handler.promise;
    }

    public complete<U, V>(command: ITransportCommand<U>, result?: V | Error): void {
        if (!this.isCommandAsync(command)) {
            this.logCommand(command, TransportLogType.RESPONSE_NO_REPLY);
            return;
        }

        command.response(result);
        this.responseSend(command);
    }

    public wait<U>(command: ITransportCommand<U>): void {
        this.logCommand(command, TransportLogType.RESPONSE_WAIT);
        throw new ExtendedError(`Method doesn't implemented`);
    }

    public dispatch<T>(event: ITransportEvent<T>): void {
        let item = this.dispatchers.get(name);
        if (_.isNil(item)) {
            return;
        }
        this.logEvent(event, TransportLogType.EVENT_SENDED);
        item.next(event);
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    protected async requestSend<U>(command: ITransportCommand<U>, options: ITransportCommandOptions): Promise<void> {
        this.logCommand(command, this.isCommandAsync(command) ? TransportLogType.REQUEST_SENDED : TransportLogType.REQUEST_NO_REPLY);
        this.observer.next(new ObservableData(LoadableEvent.STARTED, command));

        if (this.isCommandAsync(command)) {
            this.commandTimeout(command, options);
        }
        // Immediately receive the same command
        this.requestReceived(command);
    }

    protected requestReceived<U>(command: ITransportCommand<U>): void {
        this.logCommand(command, TransportLogType.REQUEST_RECEIVED);

        let listener = this.listeners.get(command.name);
        if (_.isNil(listener)) {
            this.complete(command, new ExtendedError(`No listener for "${command.name}" command`));
            return;
        }
        listener.next(command);
    }

    protected responseSend<U, V>(command: ITransportCommandAsync<U, V>): void {
        this.logCommand(command, TransportLogType.RESPONSE_SENDED);

        // Immediately receive the same commad
        this.responseReceived(command);
    }

    protected responseReceived<U, V>(command: ITransportCommandAsync<U, V>): void {
        this.logCommand(command, TransportLogType.RESPONSE_RECEIVED);
        this.commandProcessed(command);
    }
}
