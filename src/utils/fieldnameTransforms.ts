import logger from '@/logger';

const inputTypeHandler = (input: any, transform: (arg0: string) => string): any => {
	switch (typeof input) {
		case 'object':
			if (Array.isArray(input)) {
				return input.map((element) => inputTypeHandler(element, transform));
			}

			return Object.entries(input).reduce(
				(newObj, [fieldName, value]) => ({
					...newObj,
					[transform(fieldName)]: value,
				}),
				{},
			);

		case 'string':
			return transform(input);

		case 'number':
			return input;

		default:
			logger.debug('not sure what to do with this', input);
			return input;
	}
};

export const fieldnamesCamelToSnake = <T>(input: T) =>
	inputTypeHandler(input, (fieldName) =>
		fieldName.replace(/[A-Z]/g, (letter) => `_${letter?.toLowerCase()}`),
	) as T;

export const fieldnamesSnakeToCamel = <T>(input: T) =>
	inputTypeHandler(input, (fieldName) =>
		fieldName.replace(/[^a-zA-Z0-9]+(.)/g, (m, letter) => letter?.toUpperCase()),
	) as T;
