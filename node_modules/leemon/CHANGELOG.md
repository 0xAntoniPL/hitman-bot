# 6.2.0
*24 July 2018*
- Enforced usage of new Array

# 6.1.0
*4 Jan 2018*
- added flow typings generation to provide strong typing to flow users
- added `zero` bigInt export

# 6.0.0
*4 Jan 2018, first release as `leemon` library*
- `==` and `!=` replaced with `===` and `!==` in some cases
- added `'use strict'` directive
- added commonjs support
- added es6 modules support
- **breaking** removed deprecated `inverseModInt_` (because it replaced with `inverseModInt`)
- added JSDoc comments
- added [Flow](https://flow.org/) support
- added benchmarks
- published on npm


> Big Integer Library changelog

# 5.5.0
*17 Mar 2013*
 - two lines of a form like "if (x<0) x+=n" had the "if" changed to "while" to
   handle the case when x<-n. (Thanks to James Ansell for finding that bug)

# 5.4.0
*3 Oct 2009*
 - added "var i" to `greaterShift()` so i is not global. (Thanks to PŽter Szab for finding that bug)

# 5.3.0
*21 Sep 2009*
 - added `randProbPrime(k)` for probable primes
 - unrolled loop in `mont_` (slightly faster)
 - `millerRabin` now takes a bigInt parameter rather than an int

# 5.2.0
*15 Sep 2009*
 - fixed capitalization in call to `int2bigInt` in `randBigInt`
   (thanks to Emili Evripidou, Reinhold Behringer, and Samuel Macaleese for finding that bug)

# 5.1.0
*8 Oct 2007*

 - renamed `inverseModInt_` to `inverseModInt` since it doesn't change its parameters
 - added functions `GCD` and `randBigInt`, which call `GCD_` and `randBigInt_`
 - fixed a bug found by Rob Visser
 - improved comments
