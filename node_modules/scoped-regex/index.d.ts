declare namespace scopedRegex {
	interface Options {
		/**
		Only match an exact string. By default, it matches any scoped package names in a string. Useful with `RegExp#test()` to check if a string is a scoped package name.

		@default false
		*/
		readonly exact?: boolean;
	}
}

declare const scopedRegex: {
	/**
	Regular expression for matching [scoped npm package names](https://docs.npmjs.com/misc/scope).

	@returns A `RegExp` for matching scoped package names.

	@example
	```
	import scopedRegex = require('scoped-regex');

	scopedRegex({exact: true}).test('@sindresorhus/df');
	//=> true

	'foo @sindresorhus/df bar'.match(scopedRegex());
	//=> ['@sindresorhus/df']
	```
	*/
	(options?: scopedRegex.Options): RegExp;

	// TODO: Remove this for the next major release, refactor the whole definition to:
	// declare function scopedRegex(options?: scopedRegex.Options): RegExp;
	// export = scopedRegex;
	default: typeof scopedRegex;
};

export = scopedRegex;
