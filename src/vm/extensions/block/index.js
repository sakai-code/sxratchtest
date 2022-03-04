import BlockType from '../../extension-support/block-type';
import ArgumentType from '../../extension-support/argument-type';
import Cast from '../../util/cast';
import translations from './translations.json';
import blockIcon from './block-icon.png';

/**
 * Formatter which is used for translation.
 * This will be replaced which is used in the runtime.
 * @param {object} messageData - format-message object
 * @returns {string} - message for the locale
 */
let formatMessage = messageData => messageData.defaultMessage;

/**
 * Setup format-message for this extension.
 */
const setupTranslations = () => {
    const localeSetup = formatMessage.setup();
    if (localeSetup && localeSetup.translations[localeSetup.locale]) {
        Object.assign(
            localeSetup.translations[localeSetup.locale],
            translations[localeSetup.locale]
        );
    }
};

const EXTENSION_ID = 'sxratchtest';

/**
 * URL to get this extension as a module.
 * When it was loaded as a module, 'extensionURL' will be replaced a URL which is retrieved from.
 * @type {string}
 */
let extensionURL = 'https://sakai-code.github.io/sxratchtest/dist/sxratchtest.mjs';

/**
 * Scratch 3.0 blocks for example of Xcratch.
 */
class ExtensionBlocks {

    /**
     * @return {string} - the name of this extension.
     */
    static get EXTENSION_NAME () {
        return formatMessage({
            id: 'sxratchtest.name',
            default: 'sxratchtest',
            description: 'name of the extension'
        });
    }

    /**
     * @return {string} - the ID of this extension.
     */
    static get EXTENSION_ID () {
        return EXTENSION_ID;
    }

    /**
     * URL to get this extension.
     * @type {string}
     */
    static get extensionURL () {
        return extensionURL;
    }

    /**
     * Set URL to get this extension.
     * The extensionURL will be changed to the URL of the loading server.
     * @param {string} url - URL
     */
    static set extensionURL (url) {
        extensionURL = url;
    }

    /**
     * Construct a set of blocks for sxratchtest.
     * @param {Runtime} runtime - the Scratch 3.0 runtime.
     */
    constructor (runtime) {
        /**
         * The Scratch 3.0 runtime.
         * @type {Runtime}
         */
        this.runtime = runtime;

        if (runtime.formatMessage) {
            // Replace 'formatMessage' to a formatter which is used in the runtime.
            formatMessage = runtime.formatMessage;
        }
    }

    doIt (args) {
        const func = new Function(`return (${Cast.toString(args.SCRIPT)})`);
        const result = func.call(this);
        console.log(result);
        return result;
    }

    /**
     * @returns {object} metadata for this extension and its blocks.
     */
    getInfo () {
        setupTranslations();
        return {
            id: ExtensionBlocks.EXTENSION_ID,
            name: ExtensionBlocks.EXTENSION_NAME,
            extensionURL: ExtensionBlocks.extensionURL,
            blockIconURI: blockIcon,
            showStatusButton: false,
            blocks: [
                {
                    opcode: 'do-it',
                    blockType: BlockType.REPORTER,
                    blockAllThreads: false,
                    text: formatMessage({
                        id: 'sxratchtest.doIt',
                        default: 'do it [SCRIPT]',
                        description: 'execute javascript for example'
                    }),
                    func: 'doIt',
                    arguments: {
                        SCRIPT: {
                            type: ArgumentType.STRING,
                            defaultValue: '3 + 4'
                        }
                    }
                }
            ],
            menus: {
            }
        };
    }
}

<<<<<<< HEAD
    /**
     * Configurate microphone.
     * @param {boolean} use - true to use microphone.
     * @param {object} util - utility object provided by the runtime.
     * @return {?Promise} - a Promise that resolves state of the microphone or undefined if the process was yield.
     */
    configMic (use, util) {
        use = (use === true);
        if (!this.isConnected()) {
            return Promise.resolve(false);
        }
        if (this.config.mic === use) {
            return Promise.resolve(this.config.mic);
        }
        const sendPromise = this.sendCommandSet(
            [{
                id: (BLECommand.CMD_CONFIG << 5) | MbitMoreConfig.MIC,
                message: new Uint8Array([(use ? 1 : 0)]) // use microphone
            }],
            util
        );
        if (sendPromise) {
            return sendPromise
                .then(() => {
                    this.config.mic = use;
                    return this.config.mic;
                });
        }
        return;
    }

    /**
     * Play tone on the speaker.
     * @param {number} frequency - wave frequency to play [Hz]
     * @param {number} volume laudness of tone [%]
     * @param {object} util - utility object provided by the runtime.
     * @return {?Promise} - a Promise that resolves to send command or undefined if this process was yield.
     */
    playTone (frequency, volume, util) {
        if (!this.isConnected()) {
            return Promise.resolve();
        }
        const frequencyData = new DataView(new ArrayBuffer(4));
        frequencyData.setUint32(0, Math.round(1000000 / frequency), true);
        volume = Math.round(volume * 0xff / 100);
        return this.sendCommandSet(
            [{
                id: (BLECommand.CMD_AUDIO << 5) | MbitMoreAudioCommand.PLAY_TONE,
                message: new Uint8Array([
                    frequencyData.getUint8(0),
                    frequencyData.getUint8(1),
                    frequencyData.getUint8(2),
                    frequencyData.getUint8(3),
                    volume
                ])
            }],
            util
        );
    }

    /**
     * Stop playing tone on the speaker.
     * @param {object} util - utility object provided by the runtime.
     * @return {?Promise} - a Promise that resolves to send command or undefined if this process was yield.
     */
    stopTone (util) {
        if (!this.isConnected()) {
            return Promise.resolve();
        }
        return this.sendCommandSet(
            [{
                id: (BLECommand.CMD_AUDIO << 5) | MbitMoreAudioCommand.STOP_TONE,
                message: new Uint8Array([])
            }],
            util
        );
    }

    /**
     * Read sound level.
     * @return {number} - level of loudness (0 .. 255).
     */
    readSoundLevel () {
        if (!this.isConnected()) {
            return 0;
        }
        return this.soundLevel;
    }

    /**
     * Update data of acceleration, magnetic force.
     * @return {Promise} - a Promise that resolves updated data holder.
     */
    updateMotion () {
        if (!this.isConnected()) return Promise.resolve(this);
        if (this.bleBusy) {
            return Promise.resolve(this);
        }
        this.bleBusy = true;
        this.bleBusyTimeoutID = window.setTimeout(() => {
            this.bleBusy = false;
        }, 1000);
        return new Promise(resolve => {
            this._ble.read(
                MM_SERVICE.ID,
                MM_SERVICE.MOTION_CH,
                false)
                .then(result => {
                    window.clearTimeout(this.bleBusyTimeoutID);
                    this.bleBusy = false;
                    if (!result) return resolve(this);
                    const data = base64ToUint8Array(result.message);
                    const dataView = new DataView(data.buffer, 0);
                    // Accelerometer
                    this.pitch = Math.round(dataView.getInt16(0, true) * 180 / Math.PI / 1000);
                    this.roll = Math.round(dataView.getInt16(2, true) * 180 / Math.PI / 1000);
                    this.acceleration.x = 1000 * dataView.getInt16(4, true) / G;
                    this.acceleration.y = 1000 * dataView.getInt16(6, true) / G;
                    this.acceleration.z = 1000 * dataView.getInt16(8, true) / G;
                    // Magnetometer
                    this.compassHeading = dataView.getUint16(10, true);
                    this.magneticForce.x = dataView.getInt16(12, true);
                    this.magneticForce.y = dataView.getInt16(14, true);
                    this.magneticForce.z = dataView.getInt16(16, true);
                    this.resetConnectionTimeout();
                    resolve(this);
                });
        });
    }

    /**
     * Read pitch [degrees] of the micro:bit heading direction.
     * @return {number} - degree of pitch.
     */
    readPitch () {
        if (!this.isConnected()) {
            return 0;
        }
        return this.pitch;
    }

    /**
     * Read roll [degrees] of the micro:bit heading direction.
     * @return {number} - degree of roll.
     */
    readRoll () {
        if (!this.isConnected()) {
            return 0;
        }
        return this.roll;
    }

    /**
     * Read the value of gravitational acceleration [milli-g] for the axis.
     * @param {AxisSymbol} axis - direction of acceleration.
     * @return {number} - value of acceleration.
     */
    readAcceleration (axis) {
        if (!this.isConnected()) {
            return 0;
        }
        if (axis === AxisSymbol.Absolute) {
            return Math.round(
                Math.sqrt(
                    (this.acceleration.x ** 2) +
                            (this.acceleration.y ** 2) +
                            (this.acceleration.z ** 2)
                )
            );
        }
        return this.acceleration[axis];
    }

    /**
     * Read the angle (degrees) of heading direction from the north.
     * @return {number} - degree of compass heading.
     */
    readCompassHeading () {
        if (!this.isConnected()) {
            return 0;
        }
        return this.compassHeading;
    }


    /**
     * Read value of magnetic force [micro teslas] for the axis.
     * @param {AxisSymbol} axis - direction of magnetic force.
     * @return {number} - value of magnetic force.
     */
    readMagneticForce (axis) {
        if (!this.isConnected()) {
            return 0;
        }
        if (axis === AxisSymbol.Absolute) {
            return Math.round(
                Math.sqrt(
                    (this.magneticForce.x ** 2) +
                            (this.magneticForce.y ** 2) +
                            (this.magneticForce.z ** 2)
                )
            );
        }
        return this.magneticForce[axis];
    }

    /**
     * Start to scan Bluetooth LE devices to find micro:bit with MicroBit More service.
     */
    scanBLE () {
        const connectorClass = BLE;
        this._ble = new connectorClass(
            this.runtime,
            this._extensionId,
            {
                filters: [
                    {namePrefix: 'BBC micro:bit'},
                    {services: [MM_SERVICE.ID]}
                ]
            },
            this._onConnect,
            this.onDisconnect
        );
    }

    /**
     * Start to scan USB serial devices to find micro:bit v2.
     */
    scanSerial () {
        this._ble = new WebSerial(
            this.runtime,
            this._extensionId,
            {
                filters: [
                    {usbVendorId: 0x0d28, usbProductId: 0x0204}
                ]
            },
            this._onConnect,
            this.onDisconnect
        );
    }

    /**
     * Open dialog to selector communication route [BLE | USB Serial]
     */
    selectCommunicationRoute () {
        const selectDialog = document.createElement('dialog');
        selectDialog.style.padding = '0px';
        const dialogFace = document.createElement('div');
        dialogFace.style.padding = '16px';
        selectDialog.appendChild(dialogFace);
        const label = document.createTextNode(formatMessage({
            id: 'mbitMore.selectCommunicationRoute.connectWith',
            default: 'Connect with',
            description: 'label of select communication route dialog for microbit more extension'
        }));
        dialogFace.appendChild(label);
        // Dialog form
        const selectForm = document.createElement('form');
        selectForm.setAttribute('method', 'dialog');
        selectForm.style.margin = '8px';
        dialogFace.appendChild(selectForm);
        // API select
        const apiSelect = document.createElement('select');
        apiSelect.setAttribute('id', 'api');
        selectForm.appendChild(apiSelect);
        // BLE option
        const bleOption = document.createElement('option');
        bleOption.setAttribute('value', 'ble');
        bleOption.textContent = formatMessage({
            id: 'mbitMore.selectCommunicationRoute.bluetooth',
            default: 'Bluetooth',
            description: 'bluetooth button on select communication route dialog for microbit more extension'
        });
        apiSelect.appendChild(bleOption);
        // USB option
        const usbOption = document.createElement('option');
        usbOption.setAttribute('value', 'usb');
        usbOption.textContent = formatMessage({
            id: 'mbitMore.selectCommunicationRoute.usb',
            default: 'USB',
            description: 'usb button on select communication route dialog for microbit more extension'
        });
        apiSelect.appendChild(usbOption);
        // Cancel button
        const cancelButton = document.createElement('button');
        cancelButton.textContent = formatMessage({
            id: 'mbitMore.selectCommunicationRoute.cancel',
            default: 'cancel',
            description: 'cancel button on select communication route dialog for microbit more extension'
        });
        cancelButton.style.margin = '8px';
        dialogFace.appendChild(cancelButton);
        // OK button
        const confirmButton = document.createElement('button');
        confirmButton.textContent = formatMessage({
            id: 'mbitMore.selectCommunicationRoute.connect',
            default: 'connect',
            description: 'connect button on select communication route dialog for microbit more extension'
        });
        confirmButton.style.margin = '8px';
        dialogFace.appendChild(confirmButton);
        // Add onClick action
        const selectProcess = () => {
            if (apiSelect.value === 'ble') {
                this.scanBLE();
            }
            if (apiSelect.value === 'usb') {
                this.scanSerial();
            }
            document.body.removeChild(selectDialog);
        };
        cancelButton.onclick = () => {
            document.body.removeChild(selectDialog);
            this.runtime.emit(this.runtime.constructor.PERIPHERAL_REQUEST_ERROR, {
                message: `Scan was canceled by user`,
                extensionId: this._extensionId
            });
        };
        confirmButton.onclick = selectProcess;
        selectDialog.addEventListener('keydown', e => {
            if (e.code === 'Enter') {
                selectProcess();
            }
        });
        // Close when click outside of the dialog
        // selectDialog.onclick = e => {
        //     if (!e.target.closest('div')) {
        //         e.target.close();
        //         selectProcess();
        //     }
        // };
        document.body.appendChild(selectDialog);
        selectDialog.showModal();
    }

    /**
     * Whether the key is pressed at this moment.
     * @param {string} key - key in keyboard event
     * @returns {boolean} - return true when the key is pressed
     */
    isKeyPressing (key) {
        return Object.values(this.keyState).find(state => state.key === key);
    }

    /**
     * Called by the runtime when user wants to scan for a peripheral.
     */
    scan () {
        if (this._ble) {
            this._ble.disconnect();
        }
        this.bleBusy = true;
        if (('serial' in navigator) && this.isKeyPressing('Shift')) {
            this.selectCommunicationRoute();
        } else {
            this.scanBLE();
        }
    }

    /**
     * Called by the runtime when user wants to connect to a certain peripheral.
     * @param {number} id - the id of the peripheral to connect to.
     */
    connect (id) {
        if (this._ble) {
            this._ble.connectPeripheral(id);
        }
    }

    /**
     * Disconnect from the micro:bit.
     */
    disconnect () {
        if (this._ble) {
            this._ble.disconnect();
        }
        this.onDisconnect();
    }

    /**
     * Reset all the state and timeout/interval ids.
     */
    onDisconnect () {
        this.stopUpdater();
        if (this._timeoutID) {
            window.clearTimeout(this._timeoutID);
            this._timeoutID = null;
        }
    }

    /**
     * Return true if connected to the micro:bit.
     * @return {boolean} - whether the micro:bit is connected.
     */
    isConnected () {
        let connected = false;
        if (this._ble) {
            connected = this._ble.isConnected();
        }
        return connected;
    }

    /**
     * Send a command to micro:bit.
     * @param {object} command command to send.
     * @param {number} command.id ID of the command.
     * @param {Uint8Array} command.message Contents of the command.
     * @return {Promise} a Promise that resolves when the data was sent and after send command interval.
     */
    sendCommand (command) {
        const data = uint8ArrayToBase64(
            new Uint8Array([
                command.id,
                ...command.message
            ])
        );
        return new Promise(resolve => {
            this._ble.write(
                MM_SERVICE.ID,
                MM_SERVICE.COMMAND_CH,
                data,
                'base64',
                false
            );
            setTimeout(() => resolve(), this.sendCommandInterval);
        });
    }

    /**
     * Send multiple commands sequentially.
     * @param {Array.<{id: number, message: Uint8Array}>} commands array of command.
     * @param {BlockUtility} util - utility object provided by the runtime.
     * @return {?Promise} a Promise that resolves when the all commands was sent.
     */
    sendCommandSet (commands, util) {
        console.log("command:"+""+commands);
        if (!this.isConnected()) return Promise.resolve();
        if (this.bleBusy) {
            this.bleAccessWaiting = true;
            if (util) {
                util.yield(); // re-try this call after a while.
            } else {
                setTimeout(() => this.sendCommandSet(commands, util), 1);
            }
            return; // Do not return Promise.resolve() to re-try.
        }
        this.bleBusy = true;
        // Clear busy and BLE access waiting flag when the scratch-link does not respond.
        this.bleBusyTimeoutID = window.setTimeout(() => {
            this.bleBusy = false;
            this.bleAccessWaiting = false;
        }, 1000);
        return new Promise(resolve => {

       
            commands.reduce((acc, cur) => acc.then(() => this.sendCommand(cur)),
                Promise.resolve()
            )
                .then(() => {
                    window.clearTimeout(this.bleBusyTimeoutID);
                })
                .catch(err => {
                    log.log(err);
                    this._ble.handleDisconnectError(err);
                })
                .finally(() => {
                    this.bleBusy = false;
                    this.bleAccessWaiting = false;
                    resolve();
                });
        });
    }

    /**
     * Starts reading data from peripheral after BLE has connected to it.
     */
    _onConnect () {
        this._ble.read(
            MM_SERVICE.ID,
            MM_SERVICE.COMMAND_CH,
            false)
            .then(result => {
                if (!result) {
                    throw new Error('Config is not readable');
                }
                const data = base64ToUint8Array(result.message);
                const dataView = new DataView(data.buffer, 0);
                this.hardware = dataView.getUint8(0);
                this.protocol = dataView.getUint8(1);
                this.route = dataView.getUint8(2);
                this._ble.startNotifications(
                    MM_SERVICE.ID,
                    MM_SERVICE.ACTION_EVENT_CH,
                    this.onNotify);
                this._ble.startNotifications(
                    MM_SERVICE.ID,
                    MM_SERVICE.PIN_EVENT_CH,
                    this.onNotify);
                if (this.hardware === MbitMoreHardwareVersion.MICROBIT_V1) {
                    this.microbitUpdateInterval = 100; // milliseconds
                } else {
                    this._ble.startNotifications(
                        MM_SERVICE.ID,
                        MM_SERVICE.MESSAGE_CH,
                        this.onNotify);
                    this.microbitUpdateInterval = 50; // milliseconds
                }
                if (this.route === CommunicationRoute.SERIAL) {
                    this.sendCommandInterval = 100; // milliseconds
                } else {
                    this.sendCommandInterval = 30; // milliseconds
                }
                this.initConfig();
                this.bleBusy = false;
                this.startUpdater();
                this.resetConnectionTimeout();
            })
            .catch(err => this._ble.handleDisconnectError(err));
    }

    /**
     * Process the data from the incoming BLE characteristic.
     * @param {string} msg - the incoming BLE data.
     * @private
     */
    onNotify (msg) {
        const data = base64ToUint8Array(msg);
        const dataView = new DataView(data.buffer, 0);
        const dataFormat = dataView.getUint8(19);
        if (dataFormat === MbitMoreDataFormat.ACTION_EVENT) {
            const actionEventType = dataView.getUint8(0);
            if (actionEventType === MbitMoreActionEvent.BUTTON) {
                const buttonName = MbitMoreButtonID[dataView.getUint16(1, true)];
                const eventName = MbitMoreButtonEventID[dataView.getUint8(3)];
                this.buttonEvents[buttonName][eventName] = dataView.getUint32(4, true); // Timestamp
            } else if (actionEventType === MbitMoreActionEvent.GESTURE) {
                const gestureName = MbitMoreGestureID[dataView.getUint8(1)];
                this.gestureEvents[gestureName] = dataView.getUint32(2, true); // Timestamp
            }
        } else if (dataFormat === MbitMoreDataFormat.PIN_EVENT) {
            const pinIndex = dataView.getUint8(0);
            if (!this._pinEvents[pinIndex]) {
                this._pinEvents[pinIndex] = {};
            }
            const event = dataView.getUint8(1);
            this._pinEvents[pinIndex][event] =
            {
                value: dataView.getUint32(2, true), // timesamp of the edge or duration of the pulse
                timestamp: Date.now() // received time
            };
        } else if (dataFormat === MbitMoreDataFormat.DATA_NUMBER) {
            const label = new TextDecoder().decode(data.slice(0, 8).filter(char => (char !== 0)));
            this.receivedData[label] =
            {
                content: dataView.getFloat32(8, true),
                timestamp: Date.now()
            };
        } else if (dataFormat === MbitMoreDataFormat.DATA_TEXT) {
            const label = new TextDecoder().decode(data.slice(0, 8).filter(char => (char !== 0)));
            this.receivedData[label] =
            {
                content: new TextDecoder().decode(data.slice(8, 20).filter(char => (char !== 0))),
                timestamp: Date.now()
            };
        }
        this.resetConnectionTimeout();
    }

    /**
     * Cancel disconnect timeout and start counting again.
     */
    resetConnectionTimeout () {
        if (this._timeoutID) window.clearTimeout(this._timeoutID);
        this._timeoutID = window.setTimeout(() => this._ble.handleDisconnectError(BLEDataStoppedError), BLETimeout);
    }

    /**
     * Return whether the pin value is high.
     * @param {number} pin - the pin to check.
     * @return {boolean} - whether the pin is high or not.
     */
    isPinHigh (pin) {
        const level = this.readDigitalLevel(pin);
        return level === 1;
    }

    /**
     * Read digital input from the pin.
     * @param {number} pin - the pin to read.
     * @return {number} - digital input value of the pin [0|1].
     */
    readDigitalLevel (pin) {
        if (!this.isConnected()) {
            return 0;
        }
        return this.digitalLevel[pin];
    }

    /**
     * Return whether the button is pressed.
     * @param {string} buttonName - name of the button
     * @return {boolean} - true when it is pressed
     */
    isButtonPressed (buttonName) {
        if (!this.isConnected()) {
            return false;
        }
        return this.buttonState[buttonName] === 1;
    }

    /**
     * Return whether the pin is touch-mode.
     * @param {number} pinIndex - indesx of the pin
     * @return {boolean} - true when it is touch-mode
     */
    isPinTouchMode (pinIndex) {
        return this.config.pinMode[pinIndex] === MbitMorePinMode.TOUCH;
    }

    /**
     * Configurate touch mode of the pin.
     * @param {number} pinIndex - index of the pin as a button.
     * @param {object} util - utility object provided by the runtime.
     * @return {?Promise} - a Promise that resolves when configured or undefined if the process was yield.
     */
    configTouchPin (pinIndex, util) {
        if (!this.isConnected()) {
            return Promise.resolve();
        }
        if (this.isPinTouchMode(pinIndex)) {
            return Promise.resolve();
        }
        const sendPromise = this.sendCommandSet(
            [{
                id: (BLECommand.CMD_CONFIG << 5) | MbitMoreConfig.TOUCH,
                message: new Uint8Array([
                    pinIndex,
                    1
                ])
            }],
            util
        );
        if (sendPromise) {
            return sendPromise
                .then(() => {
                    this.config.pinMode[pinIndex] = MbitMorePinMode.TOUCH;
                });
        }
        return;
    }

    /**
     * Return whether the touche-pin is touched.
     * @param {string} buttonName - ID to check.
     * @return {boolean} - whether the id is high or not.
     */
    isTouched (buttonName) {
        if (!this.isConnected()) {
            return false;
        }
        return this.buttonState[buttonName] === 1;
    }

    /**
     * Return the last timestamp of the button event or undefined if the event is not received.
     * @param {MbitMoreButtonName} buttonName - name of the button to get the event.
     * @param {MbitMoreButtonEventName} eventName - name of event to get.
     * @return {?number} Timestamp of the last event or null.
     */
    getButtonEventTimestamp (buttonName, eventName) {
        if (this.buttonEvents[buttonName] && this.buttonEvents[buttonName][eventName]) {
            return this.buttonEvents[buttonName][eventName];
        }
        return null;
    }

    /**
     * Return the last timestamp of the gesture event or undefined if the event is not received.
     * @param {MbitMoreGestureName} gestureName - name of the event.
     * @return {?number} Timestamp of the last event or null.
     */
    getGestureEventTimestamp (gestureName) {
        if (this.gestureEvents[gestureName]) {
            return this.gestureEvents[gestureName];
        }
        return null;
    }

    /**
     * Return the last value of the pin event or undefined if the event was not received.
     * @param {number} pinIndex - index of the pin to get the event.
     * @param {MbitMorePinEvent} event - event to get.
     * @return {?number} Timestamp of the last event or null.
     */
    getPinEventValue (pinIndex, event) {
        if (this._pinEvents[pinIndex] && this._pinEvents[pinIndex][event]) {
            return this._pinEvents[pinIndex][event].value;
        }
        return null;
    }

    /**
     * Return the last timestamp of the pin event or undefined if the event was not received.
     * @param {number} pinIndex - index of the pin to get the event.
     * @param {MbitMorePinEvent} event - event to get.
     * @return {?number} Timestamp of the last event or null.
     */
    getPinEventTimestamp (pinIndex, event) {
        if (this._pinEvents[pinIndex] && this._pinEvents[pinIndex][event]) {
            return this._pinEvents[pinIndex][event].timestamp;
        }
        return null;
    }

    /**
     * Set event type to be get from the pin.
     * @param {number} pinIndex - Index of the pin to set.
     * @param {MbitMorePinEventType} eventType - Event type to set.
     * @param {BlockUtility} util - utility object provided by the runtime.
     * @return {?Promise} a Promise that resolves when command sending done or undefined if this process was yield.
     */
    listenPinEventType (pinIndex, eventType, util) {
        return this.sendCommandSet(
            [{
                id: (BLECommand.CMD_PIN << 5) | MbitMorePinCommand.SET_EVENT,
                message: new Uint8Array([
                    pinIndex,
                    eventType
                ])
            }],
            util
        );
    }

    /**
     * Send data to micro:bit.
     * @param {string} label - label of the data [ascii]
     * @param {string} content - content of the data [ascii | number]
     * @param {BlockUtility} util - utility object provided by the runtime.
     * @return {?Promise} a Promise that resolves when sending done or undefined if this process was yield.
     */
    sendData (label, content, util) {
        const labelData = new Array(8)
            .fill()
            .map((_value, index) => label.charCodeAt(index));
        const contentNumber = Number(content);
        let contentData;
        let type;
        if (Number.isNaN(contentNumber)) {
            type = MbitMoreSendingDataType.TEXT;
            contentData = content
                .split('')
                .map(ascii => ascii.charCodeAt(0))
                .slice(0, 11);
        } else {
            type = MbitMoreSendingDataType.NUMBER;
            const dataView = new DataView(new ArrayBuffer(4));
            dataView.setFloat32(0, contentNumber, true);
            contentData = [
                dataView.getUint8(0),
                dataView.getUint8(1),
                dataView.getUint8(2),
                dataView.getUint8(3)
            ];
        }
        return this.sendCommandSet(
            [{
                id: ((BLECommand.CMD_DATA << 5) | type),
                message: new Uint8Array([
                    ...labelData,
                    ...contentData])
            }],
            util);
    }

    /**
     * Return the last data with the label or undefined if no data received with the label.
     * @param {string} label - label to get.
     * @return {?(number | string)} data of the label or null.
     */
    getDataLabeled (label) {
        if (this.receivedData[label]) {
            return this.receivedData[label].content;
        }
        return null;
    }

    /**
     * Return the last timestamp of the data or undefined if the data is not received.
     * @param {string} label - label of the data.
     * @return {?number} Timestamp of the last data or null.
     */
    getDataTimestamp (label) {
        if (this.receivedData[label]) {
            return this.receivedData[label].timestamp;
        }
        return null;
    }
}

/**
 * Scratch 3.0 blocks to interact with a MicroBit peripheral.
 */
class MbitMoreBlocks {

    /**
     * @return {string} - the name of this extension.
     */
    static get EXTENSION_NAME () {
        return 'Microbit More';
    }

    /**
     * @return {string} - the ID of this extension.
     */
    static get EXTENSION_ID () {
        return EXTENSION_ID;
    }

    /**
     * URL to get this extension.
     * @type {string}
     */
    static get extensionURL () {
        return extensionURL;
    }

    /**
     * Set URL to get this extension.
     * @param {string} url - URL
     */
    static set extensionURL (url) {
        extensionURL = url;
    }

    /**
     * @return {array} - text and values for each gestures menu element
     */
    get GESTURES_MENU () {
        return [
            {
                text: formatMessage({
                    id: 'mbitMore.gesturesMenu.tiltUp',
                    default: 'titl up',
                    description: 'label for tilt up gesture in gesture picker for microbit more extension'
                }),
                value: MbitMoreGestureName.TILT_UP
            },
            {
                text: formatMessage({
                    id: 'mbitMore.gesturesMenu.tiltDown',
                    default: 'titl down',
                    description: 'label for tilt down gesture in gesture picker for microbit more extension'
                }),
                value: MbitMoreGestureName.TILT_DOWN
            },
            {
                text: formatMessage({
                    id: 'mbitMore.gesturesMenu.tiltLeft',
                    default: 'titl left',
                    description: 'label for tilt left gesture in gesture picker for microbit more extension'
                }),
                value: MbitMoreGestureName.TILT_LEFT
            },
            {
                text: formatMessage({
                    id: 'mbitMore.gesturesMenu.tiltRight',
                    default: 'titl right',
                    description: 'label for tilt right gesture in gesture picker for microbit more extension'
                }),
                value: MbitMoreGestureName.TILT_RIGHT
            },
            {
                text: formatMessage({
                    id: 'mbitMore.gesturesMenu.faceUp',
                    default: 'face up',
                    description: 'label for face up gesture in gesture picker for microbit more extension'
                }),
                value: MbitMoreGestureName.FACE_UP
            },
            {
                text: formatMessage({
                    id: 'mbitMore.gesturesMenu.faceDown',
                    default: 'face down',
                    description: 'label for face down gesture in gesture picker for microbit more extension'
                }),
                value: MbitMoreGestureName.FACE_DOWN
            },
            {
                text: formatMessage({
                    id: 'mbitMore.gesturesMenu.freefall',
                    default: 'freefall',
                    description: 'label for freefall gesture in gesture picker for microbit more extension'
                }),
                value: MbitMoreGestureName.FREEFALL
            },
            {
                text: formatMessage({
                    id: 'mbitMore.gesturesMenu.g3',
                    default: '3G',
                    description: 'label for 3G gesture in gesture picker for microbit more extension'
                }),
                value: MbitMoreGestureName.G3
            },
            {
                text: formatMessage({
                    id: 'mbitMore.gesturesMenu.g6',
                    default: '6G',
                    description: 'label for 6G gesture in gesture picker for microbit more extension'
                }),
                value: MbitMoreGestureName.G6
            },
            {
                text: formatMessage({
                    id: 'mbitMore.gesturesMenu.g8',
                    default: '8G',
                    description: 'label for 3G gesture in gesture picker for microbit more extension'
                }),
                value: MbitMoreGestureName.G8
            },
            {
                text: formatMessage({
                    id: 'mbitMore.gesturesMenu.shake',
                    default: 'shake',
                    description: 'label for shaken gesture in gesture picker for microbit more extension'
                }),
                value: MbitMoreGestureName.SHAKE
            }

        ];
    }


    /**
     * @return {array} - text and values for each buttons menu element
     */
    get BUTTON_ID_MENU () {
        return [
            {
                text: formatMessage({
                    id: 'mbitMore.buttonIDMenu.a',
                    default: 'A',
                    description: 'label for "A" element in button picker for Microbit More extension'
                }),
                value: MbitMoreButtonName.A
            },
            {
                text: formatMessage({
                    id: 'mbitMore.buttonIDMenu.b',
                    default: 'B',
                    description: 'label for "B" element in button picker for Microbit More extension'
                }),
                value: MbitMoreButtonName.B
            }
        ];
    }

    /**
     * @return {array} - Menu items for button event selector.
     */
    get BUTTON_EVENT_MENU () {
        return [
            {
                text: formatMessage({
                    id: 'mbitMore.buttonEventMenu.down',
                    default: 'down',
                    description: 'label for button down event'
                }),
                value: MbitMoreButtonEventName.DOWN
            },
            {
                text: formatMessage({
                    id: 'mbitMore.buttonEventMenu.up',
                    default: 'up',
                    description: 'label for button up event'
                }),
                value: MbitMoreButtonEventName.UP
            },
            {
                text: formatMessage({
                    id: 'mbitMore.buttonEventMenu.click',
                    default: 'click',
                    description: 'label for button click event'
                }),
                value: MbitMoreButtonEventName.CLICK
            // },
            // // These events are not in use because they are unstable in coal-microbit-v2.
            // {
            //     text: formatMessage({
            //         id: 'mbitMore.buttonEventMenu.hold',
            //         default: 'hold',
            //         description: 'label for button hold event'
            //     }),
            //     value: MbitMoreButtonEventName.HOLD
            // },
            // {
            //     text: formatMessage({
            //         id: 'mbitMore.buttonEventMenu.longClick',
            //         default: 'long click',
            //         description: 'label for button long click event'
            //     }),
            //     value: MbitMoreButtonEventName.LONG_CLICK
            // },
            // {
            //     text: formatMessage({
            //         id: 'mbitMore.buttonEventMenu.doubleClick',
            //         default: 'double click',
            //         description: 'label for button double click event'
            //     }),
            //     value: MbitMoreButtonEventName.DOUBLE_CLICK
            }
        ];
    }

    /**
     * @return {array} - text and values for each buttons menu element
     */
    get TOUCH_ID_MENU () {
        return [
            {
                text: formatMessage({
                    id: 'mbitMore.touchIDMenu.logo',
                    default: 'LOGO',
                    description: 'label for "LOGO" element in touch button picker for Microbit More extension'
                }),
                value: MbitMoreButtonName.LOGO
            },
            {
                text: 'P0',
                value: MbitMoreButtonName.P0
            },
            {
                text: 'P1',
                value: MbitMoreButtonName.P1
            },
            {
                text: 'P2',
                value: MbitMoreButtonName.P2
            }
        ];
    }

    /**
     * @return {array} - Menu items for touch event selector.
     */
    get TOUCH_EVENT_MENU () {
        return [
            {
                text: formatMessage({
                    id: 'mbitMore.touchEventMenu.touched',
                    default: 'touched',
                    description: 'label for touched event'
                }),
                value: MbitMoreButtonEventName.DOWN
            },
            {
                text: formatMessage({
                    id: 'mbitMore.touchEventMenu.released',
                    default: 'released',
                    description: 'label for released event'
                }),
                value: MbitMoreButtonEventName.UP
            },
            {
                text: formatMessage({
                    id: 'mbitMore.touchEventMenu.tapped',
                    default: 'tapped',
                    description: 'label for tapped event'
                }),
                value: MbitMoreButtonEventName.CLICK
            // },
            // // These events are not in use because they are unstable in coal-microbit-v2.
            // {
            //     text: formatMessage({
            //         id: 'mbitMore.touchEventMenu.hold',
            //         default: 'hold',
            //         description: 'label for hold event in touch'
            //     }),
            //     value: MbitMoreButtonEventName.HOLD
            // },
            // {
            //     text: formatMessage({
            //         id: 'mbitMore.touchEventMenu.longTapped',
            //         default: 'long tapped',
            //         description: 'label for long click event in touch'
            //     }),
            //     value: MbitMoreButtonEventName.LONG_CLICK
            // },
            // {
            //     text: formatMessage({
            //         id: 'mbitMore.touchEventMenu.doubleTapped',
            //         default: 'double tapped',
            //         description: 'label for double click event in touch'
            //     }),
            //     value: MbitMoreButtonEventName.DOUBLE_CLICK
            }
        ];
    }

    get ANALOG_IN_PINS_MENU () {
        return this._peripheral.analogIn.map(
            pinIndex =>
                Object.create({
                    text: `P${pinIndex.toString()}`,
                    value: pinIndex.toString()
                })
        );
    }


    get GPIO_MENU () {
        return this._peripheral.gpio.map(
            pinIndex =>
                Object.create({
                    text: `P${pinIndex.toString()}`,
                    value: pinIndex.toString()
                })
        );
    }

    get DIGITAL_VALUE_MENU () {
        return [
            {
                text: formatMessage({
                    id: 'mbitMore.digitalValueMenu.Low',
                    default: 'Low',
                    description: 'label for low value in digital output menu for microbit more extension'
                }),
                value: 'false'
            },
            {
                text: formatMessage({
                    id: 'mbitMore.digitalValueMenu.High',
                    default: 'High',
                    description: 'label for high value in digital output menu for microbit more extension'
                }),
                value: 'true'
            }
        ];
    }

    get AXIS_MENU () {
        return [
            {
                text: formatMessage({
                    id: 'mbitMore.axisMenu.x',
                    default: 'x',
                    description: 'label of X axis.'
                }),
                value: AxisSymbol.X
            },
            {
                text: formatMessage({
                    id: 'mbitMore.axisMenu.y',
                    default: 'y',
                    description: 'label of Y axis.'
                }),
                value: AxisSymbol.Y
            },
            {
                text: formatMessage({
                    id: 'mbitMore.axisMenu.z',
                    default: 'z',
                    description: 'label of Z axis.'
                }),
                value: AxisSymbol.Z
            },
            {
                text: formatMessage({
                    id: 'mbitMore.axisMenu.absolute',
                    default: 'absolute',
                    description: 'label of absolute value.'
                }),
                value: AxisSymbol.Absolute
            }
        ];
    }

    /**
     * @return {array} - text and values for each pin mode menu element
     */
    get PIN_MODE_MENU () {
        return [
            {
                text: formatMessage({
                    id: 'mbitMore.pinModeMenu.pullNone',
                    default: 'pull none',
                    description: 'label for pullNone mode'
                }),
                value: MbitMorePullModeName.NONE
            },
            {
                text: formatMessage({
                    id: 'mbitMore.pinModeMenu.pullUp',
                    default: 'pull up',
                    description: 'label for pullUp mode'
                }),
                value: MbitMorePullModeName.UP
            },
            {
                text: formatMessage({
                    id: 'mbitMore.pinModeMenu.pullDown',
                    default: 'pull down',
                    description: 'label for pullDown mode'
                }),
                value: MbitMorePullModeName.DOWN
            }
        ];
    }

    /**
     * @return {array} - Menu items for event selector.
     */
    get PIN_EVENT_MENU () {
        return [
            {
                text: formatMessage({
                    id: 'mbitMore.pinEventMenu.pulseLow',
                    default: 'low pulse',
                    description: 'label for low pulse event'
                }),
                value: 'PULSE_LOW'
            },
            {
                text: formatMessage({
                    id: 'mbitMore.pinEventMenu.pulseHigh',
                    default: 'high pulse',
                    description: 'label for high pulse event'
                }),
                value: 'PULSE_HIGH'
            },
            {
                text: formatMessage({
                    id: 'mbitMore.pinEventMenu.fall',
                    default: 'fall',
                    description: 'label for fall event'
                }),
                value: 'FALL'
            },
            {
                text: formatMessage({
                    id: 'mbitMore.pinEventMenu.rise',
                    default: 'rise',
                    description: 'label for rise event'
                }),
                value: 'RISE'
            }
        ];
    }

    /**
     * @return {array} - Menu items for event selector.
     */
    get PIN_EVENT_TIMESTAMP_MENU () {
        return [
            {
                text: formatMessage({
                    id: 'mbitMore.pinEventTimestampMenu.pulseLow',
                    default: 'low pulse',
                    description: 'label for low pulse event'
                }),
                value: 'PULSE_LOW'
            },
            {
                text: formatMessage({
                    id: 'mbitMore.pinEventTimestampMenu.pulseHigh',
                    default: 'high pulse',
                    description: 'label for high pulse event'
                }),
                value: 'PULSE_HIGH'
            },
            {
                text: formatMessage({
                    id: 'mbitMore.pinEventTimestampMenu.fall',
                    default: 'fall',
                    description: 'label for fall event'
                }),
                value: 'FALL'
            },
            {
                text: formatMessage({
                    id: 'mbitMore.pinEventTimestampMenu.rise',
                    default: 'rise',
                    description: 'label for rise event'
                }),
                value: 'RISE'
            }
        ];
    }

    /**
     * @return {array} - Menu items for event listening.
     */
    get PIN_EVENT_TYPE_MENU () {
        return [
            {
                text: formatMessage({
                    id: 'mbitMore.pinEventTypeMenu.none',
                    default: 'none',
                    description: 'label for remove event listener'
                }),
                value: 'NONE'
            },
            {
                text: formatMessage({
                    id: 'mbitMore.pinEventTypeMenu.pulse',
                    default: 'pulse',
                    description: 'label for pulse event type'
                }),
                value: 'ON_PULSE'
            },
            {
                text: formatMessage({
                    id: 'mbitMore.pinEventTypeMenu.edge',
                    default: 'edge',
                    description: 'label for edge event type'
                }),
                value: 'ON_EDGE'
            }
        ];
    }

    /**
     * @return {array} - Menu items for connection state.
     */
    get CONNECTION_STATE_MENU () {
        return [
            {
                text: formatMessage({
                    id: 'mbitMore.connectionStateMenu.connected',
                    default: 'connected',
                    description: 'label for connected'
                }),
                value: 'connected'
            },
            {
                text: formatMessage({
                    id: 'mbitMore.connectionStateMenu.disconnected',
                    default: 'disconnected',
                    description: 'label for disconnected'
                }),
                value: 'disconnected'
            }
        ];
    }

    /**
     * Construct a set of MicroBit blocks.
     * @param {Runtime} runtime - the Scratch 3.0 runtime.
     */
    constructor (runtime) {
        /**
         * The Scratch 3.0 runtime.
         * @type {Runtime}
         */
        this.runtime = runtime;

        if (runtime.formatMessage) {
            // Replace 'formatMessage' to a formatter which is used in the runtime.
            formatMessage = runtime.formatMessage;
        }
        // Create a new MicroBit peripheral instance
        this._peripheral = new MbitMore(this.runtime, MbitMoreBlocks.EXTENSION_ID);

        /**
         * The previous timestamps of button events.
         * @type {Object.<number, Object.<number, number>>} button ID to object with event and timestamp.
         */
        this.prevButtonEvents = {};

        /**
         * The previous timestamps of gesture events.
         * @type {Object.<number, number>} key: event ID, value: timestamp.
         */
        this.prevGestureEvents = {};

        /**
         * The previous timestamps of pin events.
         * @type {Object.<number, Object.<number, number>>} pin index to object with event and timestamp.
         */
        this.prevPinEvents = {};

        /**
         * The previous timestamps of messages.
         * @type {Object.<number, Object>} pin index to object with event and timestamp.
         */
        this.prevReceivedData = {};
    }

    /**
     * @returns {object} metadata for this extension and its blocks.
     */
    getInfo () {
        this.setupTranslations();
        return {
            id: MbitMoreBlocks.EXTENSION_ID,
            name: MbitMoreBlocks.EXTENSION_NAME,
            extensionURL: MbitMoreBlocks.extensionURL,
            blockIconURI: blockIconURI,
            showStatusButton: true,
            blocks: [
                {
                    opcode: 'whenConnectionChanged',
                    text: formatMessage({
                        id: 'mbitMore.whenConnectionChanged',
                        default: 'when micro:bit [STATE]',
                        description: 'when a micro:bit connection state changed'
                    }),
                    blockType: BlockType.HAT,
                    arguments: {
                        STATE: {
                            type: ArgumentType.STRING,
                            menu: 'connectionStateMenu',
                            defaultValue: 'connected'
                        }
                    }
                },
                '---',
                {
                    opcode: 'whenButtonEvent',
                    text: formatMessage({
                        id: 'mbitMore.whenButtonEvent',
                        default: 'when button [NAME] is [EVENT]',
                        description: 'when the selected button on the micro:bit get the selected event'
                    }),
                    blockType: BlockType.HAT,
                    arguments: {
                        NAME: {
                            type: ArgumentType.STRING,
                            menu: 'buttonIDMenu',
                            defaultValue: MbitMoreButtonName.A
                        },
                        EVENT: {
                            type: ArgumentType.STRING,
                            menu: 'buttonEventMenu',
                            defaultValue: MbitMoreButtonEventName.DOWN
                        }
                    }
                },
                {
                    opcode: 'isButtonPressed',
                    text: formatMessage({
                        id: 'mbitMore.isButtonPressed',
                        default: 'button [NAME] pressed?',
                        description: 'is the selected button on the micro:bit pressed?'
                    }),
                    blockType: BlockType.BOOLEAN,
                    arguments: {
                        NAME: {
                            type: ArgumentType.STRING,
                            menu: 'buttonIDMenu',
                            defaultValue: MbitMoreButtonName.A
                        }
                    }
                },
                {
                    opcode: 'whenTouchEvent',
                    text: formatMessage({
                        id: 'mbitMore.whenTouchEvent',
                        default: 'when pin [NAME] is [EVENT]',
                        description: 'when the selected touch pin on the micro:bit is touched'
                    }),
                    blockType: BlockType.HAT,
                    arguments: {
                        NAME: {
                            type: ArgumentType.STRING,
                            menu: 'touchIDMenu',
                            defaultValue: MbitMoreButtonName.LOGO
                        },
                        EVENT: {
                            type: ArgumentType.STRING,
                            menu: 'touchEventMenu',
                            defaultValue: MbitMoreButtonEventName.DOWN
                        }
                    }
                },
                {
                    opcode: 'isPinTouched',
                    text: formatMessage({
                        id: 'mbitMore.isPinTouched',
                        default: 'pin [NAME] is touched?',
                        description: 'is the selected pin is touched?'
                    }),
                    blockType: BlockType.BOOLEAN,
                    arguments: {
                        NAME: {
                            type: ArgumentType.STRING,
                            menu: 'touchIDMenu',
                            defaultValue: MbitMoreButtonName.LOGO
                        }
                    }
                },
                '---',
                {
                    opcode: 'whenGesture',
                    text: formatMessage({
                        id: 'mbitMore.whenGesture',
                        default: 'when [GESTURE]',
                        description: 'when the selected gesture is detected by the micro:bit'
                    }),
                    blockType: BlockType.HAT,
                    arguments: {
                        GESTURE: {
                            type: ArgumentType.STRING,
                            menu: 'gestures',
                            defaultValue: MbitMoreGestureName.SHAKE
                        }
                    }
                },
                '---',
                {
                    opcode: 'displayMatrix',
                    text: formatMessage({
                        id: 'mbitMore.displayMatrix',
                        default: 'display pattern [MATRIX] ',
                        description: 'display a pattern on the micro:bit display'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        MATRIX: {
                            type: ArgumentType.MATRIX,
                            defaultValue: '0101010101100010101000100'
                        }
                    }
                },
                {
                    opcode: 'displayText',
                    text: formatMessage({
                        id: 'mbitMore.displayText',
                        default: 'display text [TEXT] delay [DELAY] ms',
                        description: 'display text on the micro:bit display'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: 'Hello!'
                        },
                        DELAY: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 120
                        }
                    }
                },
                {
                    opcode: 'displayClear',
                    text: formatMessage({
                        id: 'mbitMore.clearDisplay',
                        default: 'clear display',
                        description: 'display nothing on the micro:bit display'
                    }),
                    blockType: BlockType.COMMAND
                },
                '---',
                {
                    opcode: 'getLightLevel',
                    text: formatMessage({
                        id: 'mbitMore.lightLevel',
                        default: 'light intensity',
                        description: 'how much the amount of light falling on the LEDs on micro:bit'
                    }),
                    blockType: BlockType.REPORTER
                },
                {
                    opcode: 'getTemperature',
                    text: formatMessage({
                        id: 'mbitMore.temperature',
                        default: 'temperature',
                        description: 'temperature (celsius) on the surface of CPU of micro:bit'
                    }),
                    blockType: BlockType.REPORTER
                },
                {
                    opcode: 'getCompassHeading',
                    text: formatMessage({
                        id: 'mbitMore.compassHeading',
                        default: 'angle with the North',
                        description: 'angle from the North to the micro:bit heading direction'
                    }),
                    blockType: BlockType.REPORTER
                },
                {
                    opcode: 'getPitch',
                    text: formatMessage({
                        id: 'mbitMore.pitch',
                        default: 'pitch',
                        description: 'nose up movement of the micro:bit from level'
                    }),
                    blockType: BlockType.REPORTER
                },
                {
                    opcode: 'getRoll',
                    text: formatMessage({
                        id: 'mbitMore.roll',
                        default: 'roll',
                        description: 'clockwise circular movement of the micro:bit from level'
                    }),
                    blockType: BlockType.REPORTER
                },
                {
                    opcode: 'getSoundLevel',
                    text: formatMessage({
                        id: 'mbitMore.soundLevel',
                        default: 'sound level',
                        description: 'level of the sound from microphone on micro:bit'
                    }),
                    blockType: BlockType.REPORTER
                },
                {
                    opcode: 'getMagneticForce',
                    text: formatMessage({
                        id: 'mbitMore.magneticForce',
                        default: 'magnetic force',
                        description: 'value of magnetic force (micro tesla)'
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        AXIS: {
                            type: ArgumentType.STRING,
                            menu: 'axis',
                            defaultValue: AxisSymbol.Absolute
                        }
                    }
                },
                {
                    opcode: 'getAcceleration',
                    text: formatMessage({
                        id: 'mbitMore.acceleration',
                        default: 'acceleration [AXIS]',
                        description: 'value of acceleration on the axis (milli-g)'
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        AXIS: {
                            type: ArgumentType.STRING,
                            menu: 'axis',
                            defaultValue: AxisSymbol.X
                        }
                    }
                },
                '---',
                {
                    opcode: 'getAnalogValue',
                    text: formatMessage({
                        id: 'mbitMore.analogValue',
                        default: 'analog value of pin [PIN]',
                        description: 'analog input value of the pin'
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        PIN: {
                            type: ArgumentType.STRING,
                            menu: 'analogInPins',
                            defaultValue: '0'
                        }
                    }
                },
                {
                    opcode: 'setPullMode',
                    text: formatMessage({
                        id: 'mbitMore.setPullMode',
                        default: 'set pin [PIN] to input [MODE]',
                        description: 'set a pin into the mode'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        PIN: {
                            type: ArgumentType.STRING,
                            menu: 'gpio',
                            defaultValue: '0'
                        },
                        MODE: {
                            type: ArgumentType.STRING,
                            menu: 'pinMode',
                            defaultValue: MbitMorePullModeName.UP
                        }
                    }
                },
                {
                    opcode: 'isPinHigh',
                    text: formatMessage({
                        id: 'mbitMore.isPinHigh',
                        default: '[PIN] pin is high?',
                        description: 'is the selected pin high as digital?'
                    }),
                    blockType: BlockType.BOOLEAN,
                    arguments: {
                        PIN: {
                            type: ArgumentType.STRING,
                            menu: 'gpio',
                            defaultValue: '0'
                        }
                    }
                },
                '---',
                {
                    opcode: 'setDigitalOut',
                    text: formatMessage({
                        id: 'mbitMore.setDigitalOut',
                        default: 'set [PIN] Digital [LEVEL]',
                        description: 'set pin to Digtal Output mode and the level(true = High)'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        PIN: {
                            type: ArgumentType.STRING,
                            menu: 'gpio',
                            defaultValue: '0'
                        },
                        LEVEL: {
                            type: ArgumentType.STRING,
                            menu: 'digitalValueMenu',
                            defaultValue: 'false'
                        }
                    }
                },
                {
                    opcode: 'setAnalogOut',
                    text: formatMessage({
                        id: 'mbitMore.setAnalogOut',
                        default: 'set [PIN] analog [LEVEL] %',
                        description: 'set pin to PWM mode and the level(0 to 1023)'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        PIN: {
                            type: ArgumentType.STRING,
                            menu: 'gpio',
                            defaultValue: '0'
                        },
                        LEVEL: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        }
                    }
                },
                {
                    opcode: 'setServo',
                    text: formatMessage({
                        id: 'mbitMore.setServo',
                        default: 'set [PIN] Servo [ANGLE]',
                        description: 'set pin to Servo mode and the angle(0 to 180)'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        PIN: {
                            type: ArgumentType.STRING,
                            menu: 'gpio',
                            defaultValue: '0'
                        },
                        ANGLE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        },
                        RANGE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 2000
                        },
                        CENTER: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1500
                        }
                    }
                },
                {
                    opcode: 'playTone',
                    text: formatMessage({
                        id: 'mbitMore.playTone',
                        default: 'play tone [FREQ] Hz volume [VOL] %',
                        description: 'play tone on the speaker'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        FREQ: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 440
                        },
                        VOL: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 100
                        }
                    }
                },
                {
                    opcode: 'stopTone',
                    text: formatMessage({
                        id: 'mbitMore.stopTone',
                        default: 'stop tone',
                        description: 'stop tone on the speaker'
                    }),
                    blockType: BlockType.COMMAND
                },
                '---',
                {
                    opcode: 'listenPinEventType',
                    text: formatMessage({
                        id: 'mbitMore.listenPinEventType',
                        default: 'catch event [EVENT_TYPE] on [PIN]',
                        description: 'listen the event on the pin'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        EVENT_TYPE: {
                            type: ArgumentType.STRING,
                            menu: 'pinEventTypeMenu',
                            defaultValue: 'NONE'
                        },
                        PIN: {
                            type: ArgumentType.STRING,
                            menu: 'gpio',
                            defaultValue: '0'
                        }
                    }
                },
                {
                    opcode: 'whenPinEvent',
                    text: formatMessage({
                        id: 'mbitMore.whenPinEvent',
                        default: 'when catch [EVENT] at pin [PIN]',
                        description: 'when catch the event at the pin'

                    }),
                    blockType: BlockType.HAT,
                    arguments: {
                        EVENT: {
                            type: ArgumentType.STRING,
                            menu: 'pinEventMenu',
                            defaultValue: 'PULSE_LOW'
                        },
                        PIN: {
                            type: ArgumentType.STRING,
                            menu: 'gpio',
                            defaultValue: '0'
                        }
                    }
                },
                {
                    opcode: 'getPinEventValue',
                    text: formatMessage({
                        id: 'mbitMore.getPinEventValue',
                        default: 'value of [EVENT] at [PIN]',
                        description: 'value of the value of the event (timestamp of the edge or duration of the pulse)'
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        EVENT: {
                            type: ArgumentType.STRING,
                            menu: 'pinEventTimestampMenu',
                            defaultValue: 'PULSE_LOW'
                        },
                        PIN: {
                            type: ArgumentType.STRING,
                            menu: 'gpio',
                            defaultValue: '0'
                        }
                    }
                },
                '---',
                {
                    opcode: 'whenDataReceived',
                    text: formatMessage({
                        id: 'mbitMore.whenDataReceived',
                        default: 'when data with loabel [LABEL] received from micro:bit',
                        description: 'when the data which has the label received'

                    }),
                    blockType: BlockType.HAT,
                    arguments: {
                        LABEL: {
                            type: ArgumentType.STRING,
                            defaultValue: 'label-01'
                        }
                    }
                },
                {
                    opcode: 'getDataLabeled',
                    text: formatMessage({
                        id: 'mbitMore.getDataLabeled',
                        default: 'data of label [LABEL]',
                        description: 'the last data which has the label'
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        LABEL: {
                            type: ArgumentType.STRING,
                            defaultValue: 'label-01'
                        }
                    }
                },
                {
                    opcode: 'sendData',
                    text: formatMessage({
                        id: 'mbitMore.sendData',
                        default: 'send data [DATA] with label [LABEL] to micro:bit',
                        description: 'send data content with label to micro:bit'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        LABEL: {
                            type: ArgumentType.STRING,
                            defaultValue: 'label-01'
                        },
                        DATA: {
                            type: ArgumentType.STRING,
                            defaultValue: 'data'
                        }
                    }
                }
            ],
            menus: {
                buttonIDMenu: {
                    acceptReporters: false,
                    items: this.BUTTON_ID_MENU
                },
                buttonEventMenu: {
                    acceptReporters: false,
                    items: this.BUTTON_EVENT_MENU
                },
                touchIDMenu: {
                    acceptReporters: false,
                    items: this.TOUCH_ID_MENU
                },
                touchEventMenu: {
                    acceptReporters: false,
                    items: this.TOUCH_EVENT_MENU
                },
                gestures: {
                    acceptReporters: false,
                    items: this.GESTURES_MENU
                },
                analogInPins: {
                    acceptReporters: false,
                    items: this.ANALOG_IN_PINS_MENU
                },
                digitalValueMenu: {
                    acceptReporters: true,
                    items: this.DIGITAL_VALUE_MENU
                },
                gpio: {
                    acceptReporters: false,
                    items: this.GPIO_MENU
                },
                axis: {
                    acceptReporters: false,
                    items: this.AXIS_MENU
                },
                pinMode: {
                    acceptReporters: false,
                    items: this.PIN_MODE_MENU
                },
                pinEventTypeMenu: {
                    acceptReporters: false,
                    items: this.PIN_EVENT_TYPE_MENU
                },
                pinEventMenu: {
                    acceptReporters: false,
                    items: this.PIN_EVENT_MENU
                },
                pinEventTimestampMenu: {
                    acceptReporters: false,
                    items: this.PIN_EVENT_TIMESTAMP_MENU
                },
                connectionStateMenu: {
                    acceptReporters: false,
                    items: this.CONNECTION_STATE_MENU
                }
            },
            // eslint-disable-next-line no-use-before-define
            translationMap: extensionTranslations
        };
    }

    /**
     * Update the previous occured time of all button events.
     */
    updatePrevButtonEvents () {
        this.prevButtonEvents = {};
        Object.entries(this._peripheral.buttonEvents).forEach(([componentID, events]) => {
            this.prevButtonEvents[componentID] = {};
            Object.entries(events).forEach(([eventName, timestamp]) => {
                this.prevButtonEvents[componentID][eventName] = timestamp;
            });
        });
    }

    /**
     * Test whether the event raised at the button.
     * @param {object} args - the block's arguments.
     * @param {string} args.NAME - name of the button.
     * @param {string} args.EVENT - name of event to catch.
     * @return {boolean} - true if the event raised.
     */
    whenButtonEvent (args) {
        if (!this.updateLastButtonEventTimer) {
            this.updateLastButtonEventTimer = setTimeout(() => {
                this.updatePrevButtonEvents();
                this.updateLastButtonEventTimer = null;
            }, this.runtime.currentStepTime);
        }
        const buttonName = args.NAME;
        const eventName = args.EVENT;
        const lastTimestamp =
            this._peripheral.getButtonEventTimestamp(buttonName, eventName);
        if (lastTimestamp === null) return false;
        if (!this.prevButtonEvents[buttonName]) return true;
        return lastTimestamp !== this.prevButtonEvents[buttonName][eventName];
    }

    /**
     * Test whether the A or B button is pressed
     * @param {object} args - the block's arguments.
     * @param {string} args.NAME - name of the button.
     * @param {object} util - utility object provided by the runtime.
     * @return {boolean} - whether the button is pressed or not.
     */
    isButtonPressed (args) {
        const buttonName = args.NAME;
        return this._peripheral.isButtonPressed(buttonName);
    }


    /**
     * Test whether the touch event raised at the pin.
     * @param {object} args - the block's arguments.
     * @param {string} args.NAME - name of the pin to catch.
     * @param {string} args.EVENT - event to catch.
     * @param {object} util - utility object provided by the runtime.
     * @return {boolean|Promise<boolean>|undefined} - true if the event raised or promise that or undefinde if yield.
     */
    whenTouchEvent (args, util) {
        const buttonName = args.NAME;
        if (buttonName === MbitMoreButtonName.LOGO) {
            return this.whenButtonEvent(args);
        }
        if (this._peripheral.isPinTouchMode(MbitMoreButtonPinIndex[buttonName])) {
            return this.whenButtonEvent(args);
        }
        const configPromise = this._peripheral.configTouchPin(MbitMoreButtonPinIndex[buttonName], util);
        if (!configPromise) return; // This thread was yielded.
        return configPromise.then(() => this.whenButtonEvent(args));
    }

    /**
     * Test whether the touch-pin is touched.
     * @param {object} args - the block's arguments.
     * @param {string} args.NAME - name of the pin.
     * @param {object} util - utility object provided by the runtime.
     * @return {boolean|Promise<boolean>|undefined} - true if touched or promise that or undefinde if yield.
     */
    isPinTouched (args, util) {
        const buttonName = args.NAME;
        if (buttonName === MbitMoreButtonName.LOGO) {
            return this._peripheral.isTouched(buttonName);
        }
        if (this._peripheral.isPinTouchMode(MbitMoreButtonPinIndex[buttonName])) {
            return this._peripheral.isTouched(buttonName);
        }
        const configPromise = this._peripheral.configTouchPin(MbitMoreButtonPinIndex[buttonName], util);
        if (!configPromise) return; // This thread was yielded.
        return configPromise.then(() => this._peripheral.isTouched(buttonName));
    }

    /**
     * Update the last occured time of all gesture events.
     */
    updatePrevGestureEvents () {
        this.prevGestureEvents = {};
        Object.entries(this._peripheral.gestureEvents).forEach(([gestureName, timestamp]) => {
            this.prevGestureEvents[gestureName] = timestamp;
        });
    }

    /**
     * Test whether the gesture event raised.
     * @param {object} args - the block's arguments.
     * @param {string} args.GESTURE - name of the gesture.
     * @return {boolean} - true if the event raised.
     */
    whenGesture (args) {
        if (!this.updateLastGestureEventTimer) {
            this.updateLastGestureEventTimer = setTimeout(() => {
                this.updatePrevGestureEvents();
                this.updateLastGestureEventTimer = null;
            }, this.runtime.currentStepTime);
        }
        const gestureName = args.GESTURE;
        const lastTimestamp =
            this._peripheral.getGestureEventTimestamp(gestureName);
        if (lastTimestamp === null) return false;
        if (!this.prevGestureEvents[gestureName]) return true;
        return lastTimestamp !== this.prevGestureEvents[gestureName];
    }

    /**
     * Display pixcel pattern on the 5x5 LED matrix with brightness and write mode.
     * @param {object} args - the block's arguments.
     * @param {string} args.MATRIX - the pattern of the pixels.
     * @param {object} util - utility object provided by the runtime.
     * @return {?Promise} - a Promise that resolves after a tick or undefinde if yield.
     */
    displayMatrix (args, util) {
        const matrixString = cast.toString(args.MATRIX)
            .replace(/！-～/g, ws => String.fromCharCode(ws.charCodeAt(0) - 0xFEE0)); // zenkaku to hankaku
        let matrixData;
        if (matrixString.includes(',')) {
            // comma separated values
            matrixData = matrixString.split(/[,\n]/);
        } else if (/[ \t]\d*[ \t]/g.test(matrixString)) {
            // space|tab separated values
            matrixData = matrixString.split(/\s/g);
        } else {
            // 0|1 pattern.
            matrixData = matrixString.replace(/\s/g, '')
                .split('');
            matrixData = matrixData.map(level => ((level === '0') ? 0 : 100));
        }
        matrixData = matrixData.map(brightness =>
            (Math.max(0,
                Math.min(100,
                    Number(brightness)) * 255 / 100))); // percent to 8bits value
        const matrix = [];
        for (let line = 0; line < 5; line++) {
            matrix[line] = [];
            for (let col = 0; col < 5; col++) {
                matrix[line][col] = matrixData[(line * 5) + col];
            }
        }
        return this._peripheral.displayPixels(matrix, util);
    }

    /**
     * Display text on the 5x5 LED matrix.
     * Displayable character is ascii and non-ascii is replaced to '?'.
     * @param {object} args - the block's arguments.
     * @param {string} args.TEXT - The contents to display.
     * @param {number} args.DELAY - The time to delay between characters, in milliseconds.
     * @param {object} util - utility object provided by the runtime.
     * @return {Promise} - a Promise that resolves after the text is done printing or undefinde if yield.
     * Note the limit is 18 characters
     * The print time is calculated by multiplying the number of horizontal pixels
     * by the default scroll delay of 120ms.
     * The number of horizontal pixels = 6px for each character in the string,
     * 1px before the string, and 5px after the string.
     */
    displayText (args, util) {
        const text = String(args.TEXT)
            .replace(/！-～/g, zenkaku =>
                String.fromCharCode(zenkaku.charCodeAt(0) - 0xFEE0)) // zenkaku to hankaku
            .replace(/[^ -~]/g, '?');
        let delay = parseInt(args.DELAY, 10);
        delay = isNaN(delay) ? 120 : delay; // Use default delay if NaN.
        const resultPromise = this._peripheral.displayText(text, delay, util);
        if (!resultPromise) return; // This thread was yielded.
        const yieldDelay = delay * ((6 * text.length) + 6);
        return new Promise(resolve => {
            setTimeout(() => {
                resolve();
            }, yieldDelay);
        });
    }

    /**
     * Turn all 5x5 matrix LEDs off.
     * @param {object} args - the block's arguments.
     * @param {object} util - utility object provided by the runtime.
     * @return {Promise} - a Promise that resolves after a tick or undefinde if yield.
     */
    displayClear (args, util) {
        const matrix = [
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0]
        ];
        return this._peripheral.displayPixels(matrix, util);
    }

    /**
     * Test the selected pin is high as digital.
     * @param {object} args - the block's arguments.
     * @param {number} args.PIN - pin ID.
     * @return {boolean} - true if the pin is high.
     */
    isPinHigh (args) {
        return this._peripheral.isPinHigh(parseInt(args.PIN, 10));
    }

    /**
     * Get amount of light (0 - 255) on the LEDs.
     * @param {object} args - the block's arguments.
     * @return {number} - light level.
     */
    getLightLevel () {
        const level = this._peripheral.readLightLevel();
        return Math.round(level * 1000 / 255) / 10;
    }

    /**
     * Get temperature (integer in celsius) of micro:bit.
     * @param {object} args - the block's arguments.
     * @return {number} - value of temperature [centigrade].
     */
    getTemperature () {
        return this._peripheral.readTemperature();
    }

    /**
     * Get loudness of the sound from microphone on micro:bit.
     * @param {object} args - the block's arguments.
     * @param {object} util - utility object provided by the runtime.
     * @return {Promise} - a Promise that resolves digital input value of the pin or undefinde if yield.
     */
    getSoundLevel (args, util) {
        const resultPromise = this._peripheral.configMic(true, util);
        if (!resultPromise) return; // This thread was yielded.
        return resultPromise
            .then(micState => {
                if (micState) {
                    return Math.round(this._peripheral.readSoundLevel() * 1000 / 255) / 10;
                }
                return 0;
            });
    }

    /**
     * Return angle from the north to the micro:bit heading direction.
     * @return {number} - degree of compass heading angle from the north (0 - 359 degrees).
     */
    getCompassHeading () {
        return this._peripheral.readCompassHeading();
    }

    /**
     * Return analog value of the pin.
     * @param {object} args - the block's arguments.
     * @param {number} args.PIN - pin ID.
     * @param {object} util - utility object provided by the runtime.
     * @return {?Promise} a Promise that resolves analog input value of the pin or undefined if this process was yield.
     */
    getAnalogValue (args, util) {
        const pinIndex = parseInt(args.PIN, 10);
        const resultPromise = this._peripheral.readAnalogIn(pinIndex, util);
        if (!resultPromise) return;
        return resultPromise.then(level => Math.round(level * 100 * 10 / 1024) / 10);
    }

    /**
     * Return digital value of the pin.
     * @param {object} args - the block's arguments.
     * @param {number} args.PIN - pin ID.
     * @return {number} - digital input value of the pin.
     */
    getDigitalValue (args) {
        return this._peripheral.readDigitalLevel(parseInt(args.PIN, 10));
    }

    /**
     * Send data with label.
     * @param {object} args - the block's arguments.
     * @property {string} args.LABEL - label of the data.
     * @property {string} args.DATA - content of the data.
     * @param {object} util - utility object provided by the runtime.
     * @return {?Promise} - a Promise that resolves when the process was done or undefined if this process was yield.
     */
    sendData (args, util) {
        if (args.LABEL.length <= 0) {
            return;
        }
        return this._peripheral.sendData(args.LABEL, args.DATA, util);
    }

    /**
     * Set pull mode of the pin.
     * @param {object} args - the block's arguments.
     * @param {number} args.PIN - pin ID.
     * @param {MbitMorePullModeName} args.MODE - mode to set.
     * @param {BlockUtility} util - utility object provided by the runtime.
     * @return {promise | undefined} - a Promise that resolves when the command was sent
     *                                 or undefined if this process was yield.
     */
    setPullMode (args, util) {
        return this._peripheral.setPullMode(parseInt(args.PIN, 10), MbitMorePullModeID[args.MODE], util);
    }

    /**
     * Set the pin to Output mode and level.
     * @param {object} args - the block's arguments.
     * @param {number} args.PIN - pin ID.
     * @param {boolean | string | number} args.LEVEL - value to be set.
     * @param {object} util - utility object provided by the runtime.
     * @return {promise | undefined} - a Promise that resolves when the command was sent
     *                                 or undefined if this process was yield.
     */
    setDigitalOut (args, util) {
        let level = (args.LEVEL === true);
        level = level || (args.LEVEL === 'true');
        if (!level) {
            const num = Number(args.LEVEL);
            if (!isNaN(num)) {
                level = (num > 0);
            }
        }
        return this._peripheral.setPinOutput(parseInt(args.PIN, 10), level, util);
    }

    /**
     * Set the pin to PWM mode and level.
     * @param {object} args - the block's arguments.
     * @param {number} args.PIN - pin ID.
     * @param {number} args.LEVEL - value[%] for PWM.
     * @param {BlockUtility} util - utility object provided by the runtime.
     * @return {promise | undefined} - a Promise that resolves when the command was sent
     *                                 or undefined if this process was yield.
     */
    setAnalogOut (args, util) {
        let percent = parseInt(args.LEVEL, 10);
        if (isNaN(percent)) {
            return;
        }
        percent = Math.max(0, Math.min(percent, 100));
        const level = Math.round(percent * 1024 / 100);
        return this._peripheral.setPinPWM(
            parseInt(args.PIN, 10),
            level,
            util
        );
    }

    /**
     * Set the pin to Servo mode and angle.
     * @param {object} args - the block's arguments.
     * @param {number} args.PIN - pin ID.
     * @param {BlockUtility} util - utility object provided by the runtime.
     * @return {promise | undefined} - a Promise that resolves when the command was sent
     *                                 or undefined if this process was yield.
     */
    setServo (args, util) {
        let angle = parseInt(args.ANGLE, 10);
        if (isNaN(angle)) return;
        angle = Math.max(0, angle);
        angle = Math.min(angle, 180);
        // let range = parseInt(args.RANGE, 10);
        // if (isNaN(range)) range = 0;
        // range = Math.max(0, range);
        // let center = parseInt(args.CENTER, 10);
        // if (isNaN(center)) range = 0;
        // center = Math.max(0, center);
        return this._peripheral.setPinServo(parseInt(args.PIN, 10), angle, null, null, util);
    }

    /**
     * Return the value of magnetic force [micro tesla] on axis.
     * @param {object} args - the block's arguments.
     * @property {AxisSymbol} AXIS - the axis (X, Y, Z, Absolute).
     * @return {number} - value of magnetic force.
     */
    getMagneticForce (args) {
        return this._peripheral.readMagneticForce(args.AXIS);
    }

    /**
     * Return the value of acceleration on the specified axis.
     * @param {object} args - the block's arguments.
     * @param {AxisSymbol} args.AXIS - direction to get.
     * @return {number} - value of acceleration.
     */
    getAcceleration (args) {
        return this._peripheral.readAcceleration(args.AXIS);
    }

    /**
     * Return pitch [degrees] of the micro:bit heading direction.
     * @return {number} - degree of pitch.
     */
    getPitch () {
        return this._peripheral.readPitch();
    }

    /**
     * Read roll [degrees] of the micro:bit heading direction.
     * @return {number} - degree of roll.
     */
    getRoll () {
        return this._peripheral.readRoll();
    }


    /**
     * Play tone on the speaker.
     * @param {object} args - the block's arguments.
     * @param {string} args.FREQ - wave frequency to play
     * @param {string} args.VOL laudness of tone
     * @param {object} util - utility object provided by the runtime.
     * @return {promise | undefined} - a Promise that resolves when the command was sent
     *                                 or undefined if this process was yield.
     */
    playTone (args, util) {
        const frequency = parseFloat(args.FREQ);
        let volume = parseInt(args.VOL, 10);
        volume = Math.min(100, (Math.max(0, volume)));
        return this._peripheral.playTone(frequency, volume, util);
    }

    /**
     * Stop playing tone on the speaker.
     * @param {object} args - the block's arguments.
     * @param {object} util - utility object provided by the runtime.
     * @return {promise | undefined} - a Promise that resolves when the command was sent
     *                                 or undefined if this process was yield.
     */
    stopTone (args, util) {
        return this._peripheral.stopTone(util);
    }

    /**
     * Set listening event type at the pin.
     * @param {object} args - the block's arguments.
     * @param {number} args.PIN - pin ID.
     * @param {string} args.EVENT_TYPE - event to listen.
     * @param {BlockUtility} util - utility object provided by the runtime.
     * @return {promise | undefined} - a Promise that resolves when the command was sent
     *                                 or undefined if this process was yield.
    */
    listenPinEventType (args, util) {
        return this._peripheral.listenPinEventType(parseInt(args.PIN, 10), MbitMorePinEventType[args.EVENT_TYPE], util);
    }

    /**
     * Rerutn value (timestamp of the edge or duration of the pulse) of the event or 0 when the event is not received.
     * @param {object} args - the block's arguments.
     * @param {number} args.PIN - pin ID.
     * @param {string} args.EVENT - event value to get.
     * @param {object} util - utility object provided by the runtime.
     * @return {number} - timestamp of the event or 0.
     */
    getPinEventValue (args) {
        const value = this._peripheral.getPinEventValue(parseInt(args.PIN, 10), MbitMorePinEvent[args.EVENT]);
        return value ? value : 0;
    }

    /**
     * Update the previous occured time of all pin events.
     */
    updatePrevPinEvents () {
        this.prevPinEvents = {};
        Object.entries(this._peripheral._pinEvents).forEach(([pinIndex, events]) => {
            this.prevPinEvents[pinIndex] = {};
            Object.entries(events).forEach(([eventID, eventData]) => {
                this.prevPinEvents[pinIndex][eventID] = {};
                Object.entries(eventData).forEach(([key, value]) => {
                    this.prevPinEvents[pinIndex][eventID][key] = value;
                });
            });
        });
    }

    /**
     * Return the previous timestamp of the pin event or undefined if the event was not received.
     * @param {number} pinIndex - index of the pin to get the event.
     * @param {MbitMorePinEvent} eventID - ID of the event to get.
     * @return {?number} Timestamp of the previous event or null.
     */
    getPrevPinEventTimestamp (pinIndex, eventID) {
        if (this.prevPinEvents[pinIndex] && this.prevPinEvents[pinIndex][eventID]) {
            return this.prevPinEvents[pinIndex][eventID].timestamp;
        }
        return null;
    }

    /**
     * Test whether the event raised at the pin.
     * @param {object} args - the block's arguments.
     * @param {number} args.PIN - pin ID.
     * @param {string} args.EVENT - event to catch.
     * @return {boolean} - true if the event raised.
     */
    whenPinEvent (args) {
        if (!this.updateLastPinEventTimer) {
            this.updateLastPinEventTimer = setTimeout(() => {
                this.updatePrevPinEvents();
                this.updateLastPinEventTimer = null;
            }, this.runtime.currentStepTime);
        }
        const pinIndex = parseInt(args.PIN, 10);
        const eventID = MbitMorePinEvent[args.EVENT];
        const lastTimestamp =
            this._peripheral.getPinEventTimestamp(pinIndex, eventID);
        if (lastTimestamp === null) return false;
        const prevTimestamp = this.getPrevPinEventTimestamp(pinIndex, eventID);
        if (prevTimestamp === null) return true;
        return lastTimestamp !== prevTimestamp;
    }

    /**
     * Rerutn the last content of the messge or undefined if the data which has the label is not received.
     * @param {object} args - the block's arguments.
     * @param {number} args.LABEL - label of the data.
     * @return {?(string | number)} - content of the data or empty string when the data was null
     */
    getDataLabeled (args) {
        const data = this._peripheral.getDataLabeled(args.LABEL);
        if (data === null) {
            return '';
        }
        return data;
    }

    /**
     * Update the previous occured time of all received data.
     */
    updatePrevReceivedData () {
        this.prevReceivedData = {};
        Object.entries(this._peripheral.receivedData).forEach(([label, contentObject]) => {
            this.prevReceivedData[label] = {};
            Object.entries(contentObject).forEach(([key, value]) => {
                this.prevReceivedData[label][key] = value;
            });
        });
    }

    /**
     * Return the previous timestamp of the data or undefined if the data was not received.
     * @param {string} label - label of the data.
     * @return {?number} Timestamp of the previous data or null.
     */
    getPrevReceivedDataTimestamp (label) {
        if (this.prevReceivedData[label]) {
            return this.prevReceivedData[label].timestamp;
        }
        return null;
    }

    /**
     * Test whether the data received which had the label.
     * @param {object} args - the block's arguments.
     * @param {number} args.LABEL - label of the data.
     * @return {boolean} - true if the data received.
     */
    whenDataReceived (args) {
        if (!this.updateLastDataTimer) {
            this.updateLastDataTimer = setTimeout(() => {
                this.updatePrevReceivedData();
                this.updateLastDataTimer = null;
            }, this.runtime.currentStepTime);
        }
        const label = args.LABEL;
        const lastTimestamp =
            this._peripheral.getDataTimestamp(label);
        if (lastTimestamp === null) return false;
        const prevTimestamp = this.getPrevReceivedDataTimestamp(label);
        if (prevTimestamp === null) return true;
        return lastTimestamp !== prevTimestamp;
    }

    /**
     * Test whether a micro:bit connected.
     * @param {object} args - the block's arguments.
     * @property {string} args.STATE - the state of connection to check.
     * @return {boolean} - true if the state is matched.
     */
    whenConnectionChanged (args) {
        const state = (args.STATE === 'connected');
        return (state === this._peripheral.isConnected());
    }

    /**
     * Setup format-message for this extension.
     */
    setupTranslations () {
        const localeSetup = formatMessage.setup();
        if (localeSetup && localeSetup.translations[localeSetup.locale]) {
            Object.assign(
                localeSetup.translations[localeSetup.locale],
                // eslint-disable-next-line no-use-before-define
                extensionTranslations[localeSetup.locale]
            );
        }
    }
}

const extensionTranslations = {
    'ja': {
        'mbitMore.whenButtonEvent': 'ボタン [NAME] が [EVENT] とき',
        'mbitMore.buttonIDMenu.a': 'A',
        'mbitMore.buttonIDMenu.b': 'B',
        'mbitMore.buttonEventMenu.down': '押された',
        'mbitMore.buttonEventMenu.hold': '長押しされた',
        'mbitMore.buttonEventMenu.up': '離された',
        'mbitMore.buttonEventMenu.click': 'クリックされた',
        'mbitMore.buttonEventMenu.longClick': 'ロングクリックされた',
        'mbitMore.buttonEventMenu.doubleClick': 'ダブルクリックされた',
        'mbitMore.isButtonPressed': 'ボタン [NAME] が押されている',
        'mbitMore.whenTouchEvent': 'ピン [NAME] が [EVENT] とき',
        'mbitMore.isPinTouched': 'ピン [NAME] がタッチされている',
        'mbitMore.touchIDMenu.logo': 'ロゴ',
        'mbitMore.touchEventMenu.touched': 'タッチされた',
        'mbitMore.touchEventMenu.hold': '長押しされた',
        'mbitMore.touchEventMenu.released': '離された',
        'mbitMore.touchEventMenu.tapped': 'タップされた',
        'mbitMore.touchEventMenu.longTapped': 'ロングタップされた',
        'mbitMore.touchEventMenu.doubleTapped': 'ダブルタップされた',
        'mbitMore.whenGesture': '[GESTURE] とき',
        'mbitMore.gesturesMenu.tiltUp': '上へ傾いた',
        'mbitMore.gesturesMenu.tiltDown': '下へ傾いた',
        'mbitMore.gesturesMenu.tiltLeft': '左へ傾いた',
        'mbitMore.gesturesMenu.tiltRight': '右へ傾いた',
        'mbitMore.gesturesMenu.faceUp': '表になった',
        'mbitMore.gesturesMenu.faceDown': '裏になった',
        'mbitMore.gesturesMenu.freefall': '落ちた',
        'mbitMore.gesturesMenu.g3': '3Gかかった',
        'mbitMore.gesturesMenu.g6': '6Gかかった',
        'mbitMore.gesturesMenu.g8': '8Gかかった',
        'mbitMore.gesturesMenu.shake': 'ゆさぶられた',
        'mbitMore.displayMatrix': 'パターン [MATRIX] を表示する',
        'mbitMore.displayText': '文字 [TEXT] を [DELAY] ミリ秒間隔で流す',
        'mbitMore.clearDisplay': '画面を消す',
        'mbitMore.isPinHigh': 'ピン [PIN] がハイである',
        'mbitMore.lightLevel': '明るさ',
        'mbitMore.temperature': '温度',
        'mbitMore.compassHeading': '北からの角度',
        'mbitMore.magneticForce': '磁力 [AXIS]',
        'mbitMore.acceleration': '加速度 [AXIS]',
        'mbitMore.pitch': 'ピッチ',
        'mbitMore.roll': 'ロール',
        'mbitMore.soundLevel': '音の大きさ',
        'mbitMore.analogValue': 'ピン [PIN] のアナログレベル',
        'mbitMore.setPullMode': 'ピン [PIN] を [MODE] 入力にする',
        'mbitMore.setDigitalOut': 'ピン [PIN] をデジタル出力 [LEVEL] にする',
        'mbitMore.setAnalogOut': 'ピン [PIN] をアナログ出力 [LEVEL] %にする',
        'mbitMore.playTone': '[FREQ] Hzの音を [VOL] %の大きさで鳴らす',
        'mbitMore.stopTone': '音を止める',
        'mbitMore.setServo': 'ピン [PIN] をサーボ [ANGLE] 度にする',
        'mbitMore.digitalValueMenu.Low': 'ロー',
        'mbitMore.digitalValueMenu.High': 'ハイ',
        'mbitMore.axisMenu.x': 'x',
        'mbitMore.axisMenu.y': 'y',
        'mbitMore.axisMenu.z': 'z',
        'mbitMore.axisMenu.absolute': '大きさ',
        'mbitMore.pinModeMenu.pullNone': '開放',
        'mbitMore.pinModeMenu.pullUp': 'プルアップ',
        'mbitMore.pinModeMenu.pullDown': 'プルダウン',
        'mbitMore.listenPinEventType': 'ピン [PIN] で [EVENT_TYPE] ',
        'mbitMore.pinEventTypeMenu.none': 'イベントを受けない',
        'mbitMore.pinEventTypeMenu.edge': 'エッジイベントを受ける',
        'mbitMore.pinEventTypeMenu.pulse': 'パルスイベントを受ける',
        'mbitMore.pinEventTypeMenu.touch': 'タッチイベントを受ける',
        'mbitMore.whenPinEvent': 'ピン [PIN] で [EVENT] イベントが上がった',
        'mbitMore.pinEventMenu.rise': 'ライズ',
        'mbitMore.pinEventMenu.fall': 'フォール',
        'mbitMore.pinEventMenu.pulseHigh': 'ハイパルス',
        'mbitMore.pinEventMenu.pulseLow': 'ローパルス',
        'mbitMore.getPinEventValue': 'ピン [PIN] の [EVENT]',
        'mbitMore.pinEventTimestampMenu.rise': 'ライズの時刻',
        'mbitMore.pinEventTimestampMenu.fall': 'フォールの時刻',
        'mbitMore.pinEventTimestampMenu.pulseHigh': 'ハイパルスの期間',
        'mbitMore.pinEventTimestampMenu.pulseLow': 'ローパルスの期間',
        'mbitMore.whenDataReceived': 'micro:bit からラベル [LABEL] のデータを受け取ったとき',
        'mbitMore.getDataLabeled': 'ラベル [LABEL] のデータ',
        'mbitMore.sendData': 'micro:bit へデータ [DATA] にラベル [LABEL] を付けて送る',
        'mbitMore.connectionStateMenu.connected': 'つながった',
        'mbitMore.connectionStateMenu.disconnected': '切れた',
        'mbitMore.whenConnectionChanged': 'micro:bit と[STATE]とき',
        'mbitMore.selectCommunicationRoute.connectWith': 'つなぎ方',
        'mbitMore.selectCommunicationRoute.bluetooth': 'Bluetooth',
        'mbitMore.selectCommunicationRoute.usb': 'USB',
        'mbitMore.selectCommunicationRoute.connect': 'つなぐ',
        'mbitMore.selectCommunicationRoute.cancel': 'やめる'
    },
    'ja-Hira': {
        'mbitMore.whenButtonEvent': '[NAME] ボタンが [EVENT] とき',
        'mbitMore.buttonIDMenu.a': 'A',
        'mbitMore.buttonIDMenu.b': 'B',
        'mbitMore.buttonEventMenu.down': 'おされた',
        'mbitMore.buttonEventMenu.hold': 'ながおしされた',
        'mbitMore.buttonEventMenu.up': 'はなされた',
        'mbitMore.buttonEventMenu.click': 'クリックされた',
        'mbitMore.buttonEventMenu.longClick': 'ロングクリックされた',
        'mbitMore.buttonEventMenu.doubleClick': 'ダブルクリックされた',
        'mbitMore.isButtonPressed': '[NAME] ボタンがおされている',
        'mbitMore.whenTouchEvent': 'ピン [NAME] が [EVENT] とき',
        'mbitMore.isPinTouched': 'ピン [NAME] がタッチされている',
        'mbitMore.touchIDMenu.logo': 'ロゴ',
        'mbitMore.touchEventMenu.touched': 'タッチされた',
        'mbitMore.touchEventMenu.hold': 'ながおしされた',
        'mbitMore.touchEventMenu.released': 'はなされた',
        'mbitMore.touchEventMenu.tapped': 'タップされた',
        'mbitMore.touchEventMenu.longTapped': 'ロングタップされた',
        'mbitMore.touchEventMenu.doubleTapped': 'ダブルタップされた',
        'mbitMore.whenGesture': '[GESTURE] とき',
        'mbitMore.gesturesMenu.tiltUp': 'うえへかたむいた',
        'mbitMore.gesturesMenu.tiltDown': 'したへかたむいた',
        'mbitMore.gesturesMenu.tiltLeft': 'ひだりへかたむいた',
        'mbitMore.gesturesMenu.tiltRight': 'みぎへかたむいた',
        'mbitMore.gesturesMenu.faceUp': 'おもてになった',
        'mbitMore.gesturesMenu.faceDown': 'うらになった',
        'mbitMore.gesturesMenu.freefall': 'おちた',
        'mbitMore.gesturesMenu.g3': '3Gかかった',
        'mbitMore.gesturesMenu.g6': '6Gかかった',
        'mbitMore.gesturesMenu.g8': '8Gかかった',
        'mbitMore.gesturesMenu.shake': 'ゆさぶられた',
        'mbitMore.displayMatrix': 'パターン [MATRIX] をひょうじする',
        'mbitMore.displayText': 'もじ [TEXT] を [DELAY] ミリびょうかんかくでながす',
        'mbitMore.clearDisplay': 'がめんをけす',
        'mbitMore.isPinHigh': 'ピン [PIN] がハイである',
        'mbitMore.lightLevel': 'あかるさ',
        'mbitMore.temperature': 'おんど',
        'mbitMore.compassHeading': 'きたからのかくど',
        'mbitMore.magneticForce': 'じりょく [AXIS]',
        'mbitMore.acceleration': 'かそくど [AXIS]',
        'mbitMore.pitch': 'ピッチ',
        'mbitMore.roll': 'ロール',
        'mbitMore.soundLevel': 'おとのおおきさ',
        'mbitMore.analogValue': 'ピン [PIN] のアナログレベル',
        'mbitMore.setPullMode': 'ピン [PIN] を [MODE] にゅうりょくにする',
        'mbitMore.setDigitalOut': 'ピン [PIN] をデジタルしゅつりょく [LEVEL] にする',
        'mbitMore.setAnalogOut': 'ピン [PIN] をアナログしゅつりょく [LEVEL] パーセントにする',
        'mbitMore.playTone': '[FREQ] ヘルツのおとを [VOL] パーセントの大きさで鳴らす',
        'mbitMore.stopTone': 'おとをとめる',
        'mbitMore.setServo': 'ピン [PIN] をサーボ [ANGLE] どにする',
        'mbitMore.digitalValueMenu.Low': 'ロー',
        'mbitMore.digitalValueMenu.High': 'ハイ',
        'mbitMore.axisMenu.x': 'x',
        'mbitMore.axisMenu.y': 'y',
        'mbitMore.axisMenu.z': 'z',
        'mbitMore.axisMenu.absolute': 'おおきさ',
        'mbitMore.pinModeMenu.pullNone': 'かいほう',
        'mbitMore.pinModeMenu.pullUp': 'プルアップ',
        'mbitMore.pinModeMenu.pullDown': 'プルダウン',
        'mbitMore.listenPinEventType': 'ピン [PIN] で [EVENT_TYPE]',
        'mbitMore.pinEventTypeMenu.none': 'イベントをうけない',
        'mbitMore.pinEventTypeMenu.edge': 'エッジイベントをうける',
        'mbitMore.pinEventTypeMenu.pulse': 'パルスイベントをうける',
        'mbitMore.pinEventTypeMenu.touch': 'タッチイベントをうける',
        'mbitMore.whenPinEvent': 'ピン [PIN] で [EVENT] イベントがあがった',
        'mbitMore.pinEventMenu.rise': 'ライズ',
        'mbitMore.pinEventMenu.fall': 'フォール',
        'mbitMore.pinEventMenu.pulseHigh': 'ハイパルス',
        'mbitMore.pinEventMenu.pulseLow': 'ローパルス',
        'mbitMore.getPinEventValue': 'ピン [PIN] の [EVENT]',
        'mbitMore.pinEventTimestampMenu.rise': 'ライズのじかん',
        'mbitMore.pinEventTimestampMenu.fall': 'フォールのじかん',
        'mbitMore.pinEventTimestampMenu.pulseHigh': 'ハイパルスのきかん',
        'mbitMore.pinEventTimestampMenu.pulseLow': 'ローパルスのきかん',
        'mbitMore.whenDataReceived': 'micro:bit からラベル [LABEL] のデータをうけとったとき',
        'mbitMore.getDataLabeled': 'ラベル [LABEL] のデータ',
        'mbitMore.sendData': 'micro:bit へデータ [DATA] にラベル [LABEL] をつけておくる',
        'mbitMore.connectionStateMenu.connected': 'つながった',
        'mbitMore.connectionStateMenu.disconnected': 'きれた',
        'mbitMore.whenConnectionChanged': 'micro:bit と[STATE]とき',
        'mbitMore.selectCommunicationRoute.connectWith': 'つなぎかた',
        'mbitMore.selectCommunicationRoute.bluetooth': 'むせん',
        'mbitMore.selectCommunicationRoute.usb': 'ゆうせん',
        'mbitMore.selectCommunicationRoute.connect': 'つなぐ',
        'mbitMore.selectCommunicationRoute.cancel': 'やめる'
    },
    'pt-br': {
        'mbitMore.lightLevel': 'Intensidade da Luz',
        'mbitMore.compassHeading': 'Está em direção ao Norte',
        'mbitMore.magneticForce': 'Força Magnética [AXIS]',
        'mbitMore.acceleration': 'Aceleração no Eixo[AXIS]',
        'mbitMore.analogValue': 'Ler Pino Analógico [PIN]',
        'mbitMore.setInput': 'Definir Pino[PIN] como entrada',
        'mbitMore.setAnalogOut': 'Definir pino PWM[PIN]com[LEVEL]',
        'mbitMore.setServo': 'Definir Servo no pino [PIN]com ângulo de [ANGLE]॰',
        'mbitMore.digitalValueMenu.Low': 'desligado',
        'mbitMore.digitalValueMenu.High': 'ligado'
    },
    'pt': {
        'mbitMore.lightLevel': 'Intensidade da Luz',
        'mbitMore.compassHeading': 'Está em direção ao Norte',
        'mbitMore.magneticForce': 'Força Magnética [AXIS]',
        'mbitMore.acceleration': 'Aceleração no Eixo[AXIS]',
        'mbitMore.analogValue': 'Ler Pino Analógico [PIN]',
        'mbitMore.setInput': 'Definir Pino[PIN] como entrada',
        'mbitMore.setAnalogOut': 'Definir pino PWM[PIN]com[LEVEL]',
        'mbitMore.setServo': 'Definir Servo no pino [PIN]com ângulo de [ANGLE]॰',
        'mbitMore.digitalValueMenu.Low': 'desligado',
        'mbitMore.digitalValueMenu.High': 'ligado'
    }
=======
export {
    ExtensionBlocks as default,
    ExtensionBlocks as blockClass
>>>>>>> parent of 9daba16 (test)
=======
export {
    ExtensionBlocks as default,
    ExtensionBlocks as blockClass
>>>>>>> parent of 9daba16 (test)
};
