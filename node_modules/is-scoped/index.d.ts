declare const isScoped: {
	/**
	Check if a string is a [scoped npm package name](https://docs.npmjs.com/misc/scope).

	@example
	```
	import isScoped = require('is-scoped');

	isScoped('@sindresorhus/df');
	//=> true

	isScoped('cat-names');
	//=> false
	```
	*/
	(input: string): boolean;

	// TODO: Remove this for the next major release, refactor the whole definition to:
	// declare function isScoped(input: string): boolean;
	// export = isScoped;
	default: typeof isScoped;
};

export = isScoped;
