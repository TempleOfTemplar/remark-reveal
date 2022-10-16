export class Notice {

    /**
     * @public
     */
    constructor(message: string | DocumentFragment, timeout?: number);
    /**
     * Change the message of this notice.
     * @public
     */
    setMessage(message: string | DocumentFragment): this;
    /**
     * @public
     */
    hide(): void;
}