# Leemon

High perfomance big integer library for modern javascript application

```bash
npm install --save leemon
```

```bash
yarn add leemon
```

[![npm version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]


This code is reincarnation of Big Integer Library created by [Leemon Baird](http://www.leemon.com/) in 2000, supported up to 2013

# Example

Fibonacci

```js
import { one, zero, add, bigInt2str } from 'leemon'

function* fibonacci() {
  let a = zero
  let b = one
  while(true){
    const c = add(a, b)
    a = b
    b = c
    yield bigInt2str(c, 10)
  }
}

const fib = fibonacci()



for (let i = 0;i<500;i++) fib.next().value

// => '225591516161936330872512695036072072046011324913758190588638866418474627738686883405015987052796968498626'

```


[npm-url]: https://www.npmjs.org/package/leemon
[npm-image]: https://badge.fury.io/js/leemon.svg
[travis-image]: https://travis-ci.org/zerobias/leemon.svg?branch=master
[travis-url]: https://travis-ci.org/zerobias/leemon


A bigInt is an array of integers storing the value in chunks of bpe bits, little endian (buff[0] is the least significant word).
Negative bigInts are stored two's complement. Almost all the functions treat bigInts as nonnegative. The few that view them as two's complement say so in their comments.
Some functions assume their parameters have at least one leading zero element.
Functions with an underscore at the end of the name put their answer into one of the arrays passed in, and have unpredictable behavior in case of overflow, so the caller must make sure the arrays are big enough to hold the answer.
But the average user should never have to call any of the underscored functions. Each important underscored function has a wrapper function of the same name without the underscore that takes care of the details for you.
For each underscored function where a parameter is modified, that same variable must not be used as another argument too.
So, you cannot square x by doing `multMod_(x,x,n)`.  You must use `squareMod_(x,n)` instead, or do `y=dup(x); multMod_(x,y,n)`.
Or simply use the `multMod(x,x,n)` function without the underscore, where such issues never arise, because non-underscored functions never change their parameters (immutable); they always allocate new memory for the answer that is returned.

# API

### Table of Contents

-   [Bool][1]
-   [findPrimes][2]
    -   [Parameters][3]
-   [millerRabinInt][4]
    -   [Parameters][5]
-   [millerRabin][6]
    -   [Parameters][7]
-   [bitSize][8]
    -   [Parameters][9]
-   [expand][10]
    -   [Parameters][11]
-   [randTruePrime][12]
    -   [Parameters][13]
-   [randProbPrime][14]
    -   [Parameters][15]
-   [randProbPrimeRounds][16]
    -   [Parameters][17]
-   [mod][18]
    -   [Parameters][19]
-   [addInt][20]
    -   [Parameters][21]
-   [mult][22]
    -   [Parameters][23]
-   [powMod][24]
    -   [Parameters][25]
-   [sub][26]
    -   [Parameters][27]
-   [add][28]
    -   [Parameters][29]
-   [inverseMod][30]
    -   [Parameters][31]
-   [multMod][32]
    -   [Parameters][33]
-   [randTruePrime\_][34]
    -   [Parameters][35]
-   [randBigInt][36]
    -   [Parameters][37]
-   [randBigInt\_][38]
    -   [Parameters][39]
-   [GCD][40]
    -   [Parameters][41]
-   [GCD\_][42]
    -   [Parameters][43]
-   [inverseMod\_][44]
    -   [Parameters][45]
-   [inverseModInt][46]
    -   [Parameters][47]
-   [eGCD\_][48]
    -   [Parameters][49]
-   [negative][50]
    -   [Parameters][51]
-   [greaterShift][52]
    -   [Parameters][53]
-   [greater][54]
    -   [Parameters][55]
-   [divide\_][56]
    -   [Parameters][57]
-   [carry\_][58]
    -   [Parameters][59]
-   [modInt][60]
    -   [Parameters][61]
-   [int2bigInt][62]
    -   [Parameters][63]
-   [str2bigInt][64]
    -   [Parameters][65]
-   [equalsInt][66]
    -   [Parameters][67]
-   [equals][68]
    -   [Parameters][69]
-   [isZero][70]
    -   [Parameters][71]
-   [bigInt2str][72]
    -   [Parameters][73]
-   [dup][74]
    -   [Parameters][75]
-   [copy\_][76]
    -   [Parameters][77]
-   [copyInt\_][78]
    -   [Parameters][79]
-   [addInt\_][80]
    -   [Parameters][81]
-   [rightShift\_][82]
    -   [Parameters][83]
-   [halve\_][84]
    -   [Parameters][85]
-   [leftShift\_][86]
    -   [Parameters][87]
-   [multInt\_][88]
    -   [Parameters][89]
-   [divInt\_][90]
    -   [Parameters][91]
-   [linComb\_][92]
    -   [Parameters][93]
-   [linCombShift\_][94]
    -   [Parameters][95]
-   [addShift\_][96]
    -   [Parameters][97]
-   [subShift\_][98]
    -   [Parameters][99]
-   [sub\_][100]
    -   [Parameters][101]
-   [add\_][102]
    -   [Parameters][103]
-   [mult\_][104]
    -   [Parameters][105]
-   [mod\_][106]
    -   [Parameters][107]
-   [multMod\_][108]
    -   [Parameters][109]
-   [squareMod\_][110]
    -   [Parameters][111]
-   [trim][112]
    -   [Parameters][113]
-   [powMod\_][114]
    -   [Parameters][115]
-   [mont\_][116]
    -   [Parameters][117]

## Bool

* * *

Big Integer Library _
Created 2000        _
Leemon Baird        _
www.leemon.com      _

* * *

Type: (`1` \| `0`)

## findPrimes

return array of all primes less than integer n

### Parameters

-   `n` **[number][118]**

Returns **[Array][119]&lt;[number][118]>**

## millerRabinInt

does a single round of Miller-Rabin base b consider x to be a possible prime?

x is a bigInt, and b is an integer, with b&lt;x

### Parameters

-   `x` **[Array][119]&lt;[number][118]>**
-   `b` **[number][118]**

Returns **(`0` \| `1`)**

## millerRabin

does a single round of Miller-Rabin base b consider x to be a possible prime?

x and b are bigInts with b&lt;x

### Parameters

-   `x` **[Array][119]&lt;[number][118]>**
-   `b` **[Array][119]&lt;[number][118]>**

Returns **(`0` \| `1`)**

## bitSize

returns how many bits long the bigInt is, not counting leading zeros.

### Parameters

-   `x` **[Array][119]&lt;[number][118]>**

Returns **[number][118]**

## expand

return a copy of x with at least n elements, adding leading zeros if needed

### Parameters

-   `x` **[Array][119]&lt;[number][118]>**
-   `n` **[number][118]**

Returns **[Array][119]&lt;[number][118]>**

## randTruePrime

return a k-bit true random prime using Maurer's algorithm.

### Parameters

-   `k` **[number][118]**

Returns **[Array][119]&lt;[number][118]>**

## randProbPrime

return a k-bit random probable prime with probability of error &lt; 2^-80

### Parameters

-   `k` **[number][118]**

Returns **[Array][119]&lt;[number][118]>**

## randProbPrimeRounds

return a k-bit probable random prime using n rounds of Miller Rabin
(after trial division with small primes)

### Parameters

-   `k` **[number][118]**
-   `n` **[number][118]**

Returns **[Array][119]&lt;[number][118]>**

## mod

return a new bigInt equal to (x mod n) for bigInts x and n.

### Parameters

-   `x` **[Array][119]&lt;[number][118]>**
-   `n` **[Array][119]&lt;[number][118]>**

Returns **[Array][119]&lt;[number][118]>**

## addInt

return (x+n) where x is a bigInt and n is an integer.

### Parameters

-   `x` **[Array][119]&lt;[number][118]>**
-   `n` **[number][118]**

Returns **[Array][119]&lt;[number][118]>**

## mult

return x\*y for bigInts x and y. This is faster when y&lt;x.

### Parameters

-   `x` **[Array][119]&lt;[number][118]>**
-   `y` **[Array][119]&lt;[number][118]>**

Returns **[Array][119]&lt;[number][118]>**

## powMod

return (x**y mod n) where x,y,n are bigInts and ** is exponentiation.

0\*\*0=1.

Faster for odd n.

### Parameters

-   `x` **[Array][119]&lt;[number][118]>**
-   `y` **[Array][119]&lt;[number][118]>**
-   `n` **[Array][119]&lt;[number][118]>**

Returns **[Array][119]&lt;[number][118]>**

## sub

return (x-y) for bigInts x and y

Negative answers will be 2s complement

### Parameters

-   `x` **[Array][119]&lt;[number][118]>**
-   `y` **[Array][119]&lt;[number][118]>**

Returns **[Array][119]&lt;[number][118]>**

## add

return (x+y) for bigInts x and y

### Parameters

-   `x` **[Array][119]&lt;[number][118]>**
-   `y` **[Array][119]&lt;[number][118]>**

Returns **[Array][119]&lt;[number][118]>**

## inverseMod

return (x\*\*(-1) mod n) for bigInts x and n.

If no inverse exists, it returns null

### Parameters

-   `x` **[Array][119]&lt;[number][118]>**
-   `n` **[Array][119]&lt;[number][118]>**

Returns **([Array][119]&lt;[number][118]> | null)**

## multMod

return (x\*y mod n) for bigInts x,y,n.

For greater speed, let y&lt;x.

### Parameters

-   `x` **[Array][119]&lt;[number][118]>**
-   `y` **[Array][119]&lt;[number][118]>**
-   `n` **[Array][119]&lt;[number][118]>**

Returns **[Array][119]&lt;[number][118]>**

## randTruePrime\_

generate a k-bit true random prime using Maurer's algorithm, and put it into ans.

The bigInt ans must be large enough to hold it.

### Parameters

-   `ans` **[Array][119]&lt;[number][118]>**
-   `k` **[number][118]**

Returns **void**

## randBigInt

Return an n-bit random BigInt (n>=1).  If s=1, then the most significant of those n bits is set to 1.

### Parameters

-   `n` **[number][118]**
-   `s` **[number][118]**

Returns **[Array][119]&lt;[number][118]>**

## randBigInt\_

Set b to an n-bit random BigInt.  If s=1, then the most significant of those n bits is set to 1.

Array b must be big enough to hold the result. Must have n>=1

### Parameters

-   `b` **[Array][119]&lt;[number][118]>**
-   `n` **[number][118]**
-   `s` **[number][118]**

Returns **void**

## GCD

Return the greatest common divisor of bigInts x and y (each with same number of elements).

### Parameters

-   `x` **[Array][119]&lt;[number][118]>**
-   `y` **[Array][119]&lt;[number][118]>**

Returns **[Array][119]&lt;[number][118]>**

## GCD\_

set x to the greatest common divisor of bigInts x and y (each with same number of elements).

y is destroyed.

### Parameters

-   `x` **[Array][119]&lt;[number][118]>**
-   `y` **[Array][119]&lt;[number][118]>**

Returns **void**

## inverseMod\_

do x=x\*\*(-1) mod n, for bigInts x and n.

If no inverse exists, it sets x to zero and returns 0, else it returns 1.
The x array must be at least as large as the n array.

### Parameters

-   `x` **[Array][119]&lt;[number][118]>**
-   `n` **[Array][119]&lt;[number][118]>**

Returns **(`0` \| `1`)**

## inverseModInt

return x\*\*(-1) mod n, for integers x and n.

Return 0 if there is no inverse

### Parameters

-   `x` **[number][118]**
-   `n` **[number][118]**

Returns **[number][118]**

## eGCD\_

Given positive bigInts x and y, change the bigints v, a, and b to positive bigInts such that:

     v = GCD_(x,y) = a*x-b*y

The bigInts v, a, b, must have exactly as many elements as the larger of x and y.

### Parameters

-   `x` **[Array][119]&lt;[number][118]>**
-   `y` **[Array][119]&lt;[number][118]>**
-   `v` **[Array][119]&lt;[number][118]>**
-   `a` **[Array][119]&lt;[number][118]>**
-   `b` **[Array][119]&lt;[number][118]>**

Returns **void**

## negative

is bigInt x negative?

### Parameters

-   `x` **[Array][119]&lt;[number][118]>**

Returns **(`1` \| `0`)**

## greaterShift

is (x &lt;&lt; (shift\*bpe)) > y?

x and y are nonnegative bigInts
shift is a nonnegative integer

### Parameters

-   `x` **[Array][119]&lt;[number][118]>**
-   `y` **[Array][119]&lt;[number][118]>**
-   `shift` **[number][118]**

Returns **(`1` \| `0`)**

## greater

is x > y?

x and y both nonnegative

### Parameters

-   `x` **[Array][119]&lt;[number][118]>**
-   `y` **[Array][119]&lt;[number][118]>**

Returns **(`1` \| `0`)**

## divide\_

divide x by y giving quotient q and remainder r.

    q = floor(x/y)
    r = x mod y

All 4 are bigints.

-   x must have at least one leading zero element.
-   y must be nonzero.
-   q and r must be arrays that are exactly the same length as x. (Or q can have more).
-   Must have x.length >= y.length >= 2.

### Parameters

-   `x` **[Array][119]&lt;[number][118]>**
-   `y` **[Array][119]&lt;[number][118]>**
-   `q` **[Array][119]&lt;[number][118]>**
-   `r` **[Array][119]&lt;[number][118]>**

Returns **void**

## carry\_

do carries and borrows so each element of the bigInt x fits in bpe bits.

### Parameters

-   `x` **[Array][119]&lt;[number][118]>**

Returns **void**

## modInt

return x mod n for bigInt x and integer n.

### Parameters

-   `x` **[Array][119]&lt;[number][118]>**
-   `n` **[number][118]**

Returns **[number][118]**

## int2bigInt

convert the integer t into a bigInt with at least the given number of bits.
the returned array stores the bigInt in bpe-bit chunks, little endian (buff[0] is least significant word)
Pad the array with leading zeros so that it has at least minSize elements.

There will always be at least one leading 0 element.

### Parameters

-   `t` **[number][118]**
-   `bits` **[number][118]**
-   `minSize` **[number][118]**

Returns **[Array][119]&lt;[number][118]>**

## str2bigInt

return the bigInt given a string representation in a given base.
Pad the array with leading zeros so that it has at least minSize elements.
If base=-1, then it reads in a space-separated list of array elements in decimal.

The array will always have at least one leading zero, unless base=-1.

### Parameters

-   `s` **[string][120]**
-   `base` **[number][118]**
-   `minSize` **[number][118]?**

Returns **[Array][119]&lt;[number][118]>**

## equalsInt

is bigint x equal to integer y?

y must have less than bpe bits

### Parameters

-   `x` **[Array][119]&lt;[number][118]>**
-   `y` **[number][118]**

Returns **(`1` \| `0`)**

## equals

are bigints x and y equal?

this works even if x and y are different lengths and have arbitrarily many leading zeros

### Parameters

-   `x` **[Array][119]&lt;[number][118]>**
-   `y` **[Array][119]&lt;[number][118]>**

Returns **(`1` \| `0`)**

## isZero

is the bigInt x equal to zero?

### Parameters

-   `x` **[Array][119]&lt;[number][118]>**

Returns **(`1` \| `0`)**

## bigInt2str

Convert a bigInt into a string in a given base, from base 2 up to base 95.

Base -1 prints the contents of the array representing the number.

### Parameters

-   `x` **[Array][119]&lt;[number][118]>**
-   `base` **[number][118]**

Returns **[string][120]**

## dup

Returns a duplicate of bigInt x

### Parameters

-   `x` **[Array][119]&lt;[number][118]>**

Returns **[Array][119]&lt;[number][118]>**

## copy\_

do x=y on bigInts x and y.

x must be an array at least as big as y (not counting the leading zeros in y).

### Parameters

-   `x` **[Array][119]&lt;[number][118]>**
-   `y` **[Array][119]&lt;[number][118]>**

Returns **void**

## copyInt\_

do x=y on bigInt x and integer y.

### Parameters

-   `x` **[Array][119]&lt;[number][118]>**
-   `n` **[number][118]**

Returns **void**

## addInt\_

do x=x+n where x is a bigInt and n is an integer.

x must be large enough to hold the result.

### Parameters

-   `x` **[Array][119]&lt;[number][118]>**
-   `n` **[number][118]**

Returns **void**

## rightShift\_

right shift bigInt x by n bits.

    0 <= n < bpe.

### Parameters

-   `x` **[Array][119]&lt;[number][118]>**
-   `n` **[number][118]**

Returns **void**

## halve\_

do x=floor(|x|/2)\*sgn(x) for bigInt x in 2's complement

### Parameters

-   `x` **[Array][119]&lt;[number][118]>**

Returns **void**

## leftShift\_

left shift bigInt x by n bits

### Parameters

-   `x` **[Array][119]&lt;[number][118]>**
-   `n` **[number][118]**

Returns **void**

## multInt\_

do x=x\*n where x is a bigInt and n is an integer.

x must be large enough to hold the result.

### Parameters

-   `x` **[Array][119]&lt;[number][118]>**
-   `n` **[number][118]**

Returns **void**

## divInt\_

do x=floor(x/n) for bigInt x and integer n, and return the remainder

### Parameters

-   `x` **[Array][119]&lt;[number][118]>**
-   `n` **[number][118]**

Returns **[number][118]** remainder

## linComb\_

do the linear combination x=a_x+b_y for bigInts x and y, and integers a and b.

x must be large enough to hold the answer.

### Parameters

-   `x` **[Array][119]&lt;[number][118]>**
-   `y` **[Array][119]&lt;[number][118]>**
-   `a` **[number][118]**
-   `b` **[number][118]**

Returns **void**

## linCombShift\_

do the linear combination x=a_x+b_(y&lt;&lt;(ys\*bpe)) for bigInts x and y, and integers a, b and ys.

x must be large enough to hold the answer.

### Parameters

-   `x` **[Array][119]&lt;[number][118]>**
-   `y` **[Array][119]&lt;[number][118]>**
-   `b` **[number][118]**
-   `ys` **[number][118]**

Returns **void**

## addShift\_

do x=x+(y&lt;&lt;(ys\*bpe)) for bigInts x and y, and integer ys.

x must be large enough to hold the answer.

### Parameters

-   `x` **[Array][119]&lt;[number][118]>**
-   `y` **[Array][119]&lt;[number][118]>**
-   `ys` **[number][118]**

Returns **void**

## subShift\_

do x=x-(y&lt;&lt;(ys\*bpe)) for bigInts x and y, and integer ys

x must be large enough to hold the answer

### Parameters

-   `x` **[Array][119]&lt;[number][118]>**
-   `y` **[Array][119]&lt;[number][118]>**
-   `ys` **[number][118]**

Returns **void**

## sub\_

do x=x-y for bigInts x and y

x must be large enough to hold the answer

negative answers will be 2s complement

### Parameters

-   `x` **[Array][119]&lt;[number][118]>**
-   `y` **[Array][119]&lt;[number][118]>**

Returns **void**

## add\_

do x=x+y for bigInts x and y

x must be large enough to hold the answer

### Parameters

-   `x` **[Array][119]&lt;[number][118]>**
-   `y` **[Array][119]&lt;[number][118]>**

Returns **void**

## mult\_

do x=x\*y for bigInts x and y.

This is faster when y&lt;x.

### Parameters

-   `x` **[Array][119]&lt;[number][118]>**
-   `y` **[Array][119]&lt;[number][118]>**

Returns **void**

## mod\_

do x=x mod n for bigInts x and n

### Parameters

-   `x` **[Array][119]&lt;[number][118]>**
-   `n` **[Array][119]&lt;[number][118]>**

Returns **void**

## multMod\_

do x=x\*y mod n for bigInts x,y,n.

for greater speed, let y&lt;x.

### Parameters

-   `x` **[Array][119]&lt;[number][118]>**
-   `y` **[Array][119]&lt;[number][118]>**
-   `n` **[Array][119]&lt;[number][118]>**

Returns **void**

## squareMod\_

do x=x\*x mod n for bigInts x,n.

### Parameters

-   `x` **[Array][119]&lt;[number][118]>**
-   `n` **[Array][119]&lt;[number][118]>**

Returns **void**

## trim

return x with exactly k leading zero elements

### Parameters

-   `x` **[Array][119]&lt;[number][118]>**
-   `k` **[number][118]**

Returns **[Array][119]&lt;[number][118]>**

## powMod\_

do `x=x**y mod n`, where x,y,n are bigInts and `**` is exponentiation.  `0**0=1`.

this is faster when n is odd.

x usually needs to have as many elements as n.

### Parameters

-   `x` **[Array][119]&lt;[number][118]>**
-   `y` **[Array][119]&lt;[number][118]>**
-   `n` **[Array][119]&lt;[number][118]>**

Returns **void**

## mont\_

do x=x_y_Ri mod n for bigInts x,y,n,
where Ri = 2\*_(-kn_bpe) mod n, and kn is the
number of elements in the n array, not
counting leading zeros.

x array must have at least as many elemnts as the n array
It's OK if x and y are the same variable.

must have:

-   x,y &lt; n
-   n is odd
-   np = -(n^(-1)) mod radix

### Parameters

-   `x` **[Array][119]&lt;[number][118]>**
-   `y` **[Array][119]&lt;[number][118]>**
-   `n` **[Array][119]&lt;[number][118]>**
-   `np` **[number][118]**

Returns **void**

[1]: #bool

[2]: #findprimes

[3]: #parameters

[4]: #millerrabinint

[5]: #parameters-1

[6]: #millerrabin

[7]: #parameters-2

[8]: #bitsize

[9]: #parameters-3

[10]: #expand

[11]: #parameters-4

[12]: #randtrueprime

[13]: #parameters-5

[14]: #randprobprime

[15]: #parameters-6

[16]: #randprobprimerounds

[17]: #parameters-7

[18]: #mod

[19]: #parameters-8

[20]: #addint

[21]: #parameters-9

[22]: #mult

[23]: #parameters-10

[24]: #powmod

[25]: #parameters-11

[26]: #sub

[27]: #parameters-12

[28]: #add

[29]: #parameters-13

[30]: #inversemod

[31]: #parameters-14

[32]: #multmod

[33]: #parameters-15

[34]: #randtrueprime_

[35]: #parameters-16

[36]: #randbigint

[37]: #parameters-17

[38]: #randbigint_

[39]: #parameters-18

[40]: #gcd

[41]: #parameters-19

[42]: #gcd_

[43]: #parameters-20

[44]: #inversemod_

[45]: #parameters-21

[46]: #inversemodint

[47]: #parameters-22

[48]: #egcd_

[49]: #parameters-23

[50]: #negative

[51]: #parameters-24

[52]: #greatershift

[53]: #parameters-25

[54]: #greater

[55]: #parameters-26

[56]: #divide_

[57]: #parameters-27

[58]: #carry_

[59]: #parameters-28

[60]: #modint

[61]: #parameters-29

[62]: #int2bigint

[63]: #parameters-30

[64]: #str2bigint

[65]: #parameters-31

[66]: #equalsint

[67]: #parameters-32

[68]: #equals

[69]: #parameters-33

[70]: #iszero

[71]: #parameters-34

[72]: #bigint2str

[73]: #parameters-35

[74]: #dup

[75]: #parameters-36

[76]: #copy_

[77]: #parameters-37

[78]: #copyint_

[79]: #parameters-38

[80]: #addint_

[81]: #parameters-39

[82]: #rightshift_

[83]: #parameters-40

[84]: #halve_

[85]: #parameters-41

[86]: #leftshift_

[87]: #parameters-42

[88]: #multint_

[89]: #parameters-43

[90]: #divint_

[91]: #parameters-44

[92]: #lincomb_

[93]: #parameters-45

[94]: #lincombshift_

[95]: #parameters-46

[96]: #addshift_

[97]: #parameters-47

[98]: #subshift_

[99]: #parameters-48

[100]: #sub_

[101]: #parameters-49

[102]: #add_

[103]: #parameters-50

[104]: #mult_

[105]: #parameters-51

[106]: #mod_

[107]: #parameters-52

[108]: #multmod_

[109]: #parameters-53

[110]: #squaremod_

[111]: #parameters-54

[112]: #trim

[113]: #parameters-55

[114]: #powmod_

[115]: #parameters-56

[116]: #mont_

[117]: #parameters-57

[118]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number

[119]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array

[120]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String

