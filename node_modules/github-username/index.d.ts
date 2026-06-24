/**
Get the GitHub username from an email address if the email can be found in any commits on GitHub.

@param email - Email address for the user of whom you want the username.
@param token - GitHub [personal access token](https://github.com/settings/tokens/new).
@returns The username for the `email` or `undefined` if it cannot be found.

@example
```
import githubUsername = require('github-username');

(async () => {
	console.log(await githubUsername('sindresorhus@gmail.com'));
	//=> 'sindresorhus'
})();
```
*/
declare function githubUsername(email: string, token?: string): Promise<string | undefined>;

export = githubUsername;
