import React from 'react';

let incrementer = 1;

/* eslint-disable react-hooks/rules-of-hooks */

/**
 * Function to be used as a react hook.
 * This function can _only_ be called from within a react functional component.
 * Pass any parameters you want to use in your fetch function.
 * @typedef hookFunction
 * @type function
 */

/**
 * This function needs to be called to eventually update all components that are using the hook function.
 * You can do selective updates based upon which props have been given to your hooks.
 *
 * For example, if you created a hook that takes one prop "id", you can update only components using the hook
 * with an id of "5", like this: `hookUpdateFunction((hookId) => hookId === 5)`.
 * @typedef hookUpdateFunction
 * @type function
 * @params {function} [updateTester] Function that should return true, if a component using the hook with specific props should update.
 */

/**
 * First part of the curried hook fetch function. Used to bring the hook updater function within the focus of the fetch
 * function. This is _only_ called once upon hook initialization to prepare the fetch function scope.
 * @typedef preFetchFunction
 * @type function
 * @params {hookUpdateFunction} [updateFunction]
 * @returns {fetchFunction}
 */

/**
 * This function is actually called upon _every_ render of a component which uses the hook. So make sure you pre-cache the response
 * and _only_ serve data from that cache.
 * If you want to update the data, simply overwrite the cache and call the hook update function to make the components render again.
 * @typedef fetchFunction
 * @type function
 * @params {*} [any]
 * @returns {*} [any]
 */
window.hooks = {};
/**
 * Creates a new react hook and an updater function for it.
 * @param {string} hookName The name of the hook. For example "useSomething" - for seeing the actual hook names in react dev tools.
 * @param {preFetchFunction} fetchFunction Curried function that will be called to fetch data when the hook is being called. Format: (hookUpdateFunction) => ([hook props]) => {...}
 * @returns {[hookFunction, hookUpdateFunction]}
 */
export const createHook = (hookName, fetchFunction) => {
	const mountedComponents = new Map();

	window.hooks[hookName] = mountedComponents;

	const hookUpdater = function () {
		mountedComponents.forEach((props) => {
			const updateValue = props[0];
			const updateFunction = props[1];
			const hookArguments = props[2];
			const nextValue = updateValue + 1;

			if (!arguments.length) {
				updateFunction(nextValue);
				return;
			}

			if (arguments.length === 1 && typeof arguments[0] === 'function') {
				if (arguments[0].apply(arguments[0], hookArguments)) {
					updateFunction(nextValue);
				}
				return;
			}

			if (arguments.length !== hookArguments.length) {
				return;
			}

			for (let i = 0; i < arguments.length; i++) {
				if (arguments[i] !== hookArguments[i]) {
					return;
				}
			}

			updateFunction(nextValue);
		});
	};

	const hookFunction = (...data) => {
		const [componentId] = React.useState(incrementer);
		const [update, setUpdate] = React.useState(0);

		if (componentId === incrementer) {
			incrementer += 1;
		}

		const preparedFetchFunction = fetchFunction(hookUpdater);

		const initialData = preparedFetchFunction.apply(null, data);

		mountedComponents.set(componentId, [update, setUpdate, data]);

		React.useEffect(
			() => () => {
				mountedComponents.delete(componentId);
			}
			, [mountedComponents, componentId]
		);

		return initialData;
	};

	Object.defineProperty(hookFunction, 'name', {value: hookName});

	return [hookFunction, hookUpdater];
};

export default createHook;
