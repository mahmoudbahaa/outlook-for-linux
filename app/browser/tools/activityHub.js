const instance = require('./instance');
/**
 * @type {Array<{handler:(data)=>void,event:string,handle:number}>}
 */
const eventHandlers = [];

// Supported events
const supportedEvents = [
	'activities-count-updated',
	'my-status-changed'
];

class ActivityHub {
	constructor() {
	}

	/**
	 * @param {'activities-count-updated'|'my-status-changed'} event
	 * @param {(data)=>void} handler
	 * @returns {number} handle 
	 */
	on(event, handler) {
		return addEventHandler(event, handler);
	}

	/**
	 * @param {'activities-count-updated'|'my-status-changed'} event
	 * @param {number} handle
	 * @returns {number} handle 
	 */
	off(event, handle) {
		return removeEventHandler(event, handle);
	}

	start() {
		instance.whenReady().then(assignEventHandlers);
	}

	setDefaultTitle(title) {
		instance.whenReady().then(inst => {
			inst.controller.pageTitleDefault = title;
		});
	}

	/**
	 * @param {number} state 
	 */
	setMachineState(state) {
		instance.whenReady().then((inst) => {
			if (state === 1) {
				this.refreshAppState(inst.controller, state);
			} else {
				inst.controller.appStateService.setMachineState(state);
			}
		});
	}

	refreshAppState(controller, state) {
		const self = controller.appStateService;
		controller.appStateService.refreshAppState.apply(self, [() => {
			self.inactiveStartTime = null;
			self.setMachineState(state);
			self.setActive(state == 1 && (self.current == 4 || self.current == 5) ? 3 : self.current);
		}, '', null, null]);
	}
}

function isSupportedEvent(event) {
	return supportedEvents.some(e => {
		return e === event;
	});
}

function isFunction(func) {
	return typeof (func) === 'function';
}

function getHandleIndex(event, handle) {
	return eventHandlers.findIndex(h => {
		return h.event === event && h.handle === handle;
	});
}

function addEventHandler(event, handler) {
	let handle;
	if (isSupportedEvent(event) && isFunction(handler)) {
		handle = Math.ceil(Math.random() * 100000);
		eventHandlers.push({
			event: event,
			handle: handle,
			handler: handler
		});
	}
	return handle;
}

function removeEventHandler(event, handle) {
	const handlerIndex = getHandleIndex(event, handle);
	if (handlerIndex > -1) {
		eventHandlers[handlerIndex].handler = null;
		eventHandlers.splice(handlerIndex, 1);
		return handle;
	}

	return null;
}

/**
 * 
 * @param {'activities-count-updated'|'my-status-changed'} event
 * @returns {Array<{handler:(data)=>void,event:string,handle:number}>} handlers
 */
function getEventHandlers(event) {
	return eventHandlers.filter(e => {
		return e.event === event;
	});
}

/**
 * @param {{controller:object,injector:object}} inst 
 */
function assignEventHandlers(inst) {
	assignActivitiesCountUpdateHandler(inst.controller);
	assignMyStatusChangedHandler(inst.controller);
	performPlatformTweaks(inst.controller);
}

function performPlatformTweaks(controller) {
	const isRunningOnWindows = process.platform === 'win32' || process.platform === 'linux';
	controller.callingService.callingAlertsService.isRunningOnWindows = () => isRunningOnWindows;
}

// Handlers
function assignActivitiesCountUpdateHandler(controller) {
	controller.eventingService.$on(
		controller.$scope,
		controller.constants.events.notifications.bellCountUpdated,
		() => onActivitiesCountUpdated(controller));

	controller.chatListService.safeSubscribe(
		controller.$scope,
		() => onActivitiesCountUpdated(controller),
		window.outlookpace.services.ChatListServiceEvents.EventType_UnreadCount);
	onActivitiesCountUpdated(controller);
}

function assignMyStatusChangedHandler(controller) {
	controller.eventingService.$on(
		controller.$scope,
		controller.constants.events.presence.myStatusChanged,
		(event, data) => onMyStatusChanged(controller, data));
}

async function onActivitiesCountUpdated(controller) {
	const count = controller.bellNotificationsService.getNewActivitiesCount() + controller.chatListService.getUnreadCountFromChatList();
	const handlers = getEventHandlers('activities-count-updated');
	for (const handler of handlers) {
		handler.handler({ count: count });
	}
}

async function onMyStatusChanged(controller, data) {
	const handlers = getEventHandlers('my-status-changed');
	for (const handler of handlers) {
		handler.handler({ data: data, isInactive: window.outlookpace.services.ApplicationState[controller.appStateService.current] === 'Inactive' || window.outlookpace.services.ApplicationState[controller.appStateService.current] === 'LongInactive' });
	}
}

const activityHub = new ActivityHub();
module.exports = activityHub;
