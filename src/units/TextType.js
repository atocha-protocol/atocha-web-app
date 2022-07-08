// import {assert} from "@polkadot/util";

const TEXT_TYPE = {
  FULL_LOWERCASE_WITH_NUMBER_SPACE: 1,
  FULL_UPPERCASE_WITH_NUMBER_SPACE: 2,
  FULL_ASCII: 3,
  NOT_FULL_ASCII: 4,
  HAS_SPACE: 5,
  NO_SPACE: 6
}

function isType(txt, typeSign) {
  switch (typeSign) {
    case TEXT_TYPE.FULL_LOWERCASE_WITH_NUMBER_SPACE :
      return matchLowerCaseWithNumberSpace(txt)
    case TEXT_TYPE.FULL_UPPERCASE_WITH_NUMBER_SPACE :
      return matchUpperCaseWithNumberSpace(txt)
    case TEXT_TYPE.FULL_ASCII :
      return matchFullAscii(txt)
    case TEXT_TYPE.NOT_FULL_ASCII :
      return matchNotFullAscii(txt)
    case TEXT_TYPE.HAS_SPACE :
      return matchHasSpace(txt)
    case TEXT_TYPE.NO_SPACE :

      return matchNoSpace(txt)

  }

  return false
}

function matchLowerCaseWithNumberSpace(txt) {
  // const pattern=new RegExp(/^[A-Za-z0-9_-]+$/);
  const pattern=new RegExp(/^[a-z0-9 ]+$/);
  return pattern.test(txt)
}

function matchUpperCaseWithNumberSpace(txt) {
  const pattern=new RegExp(/^[A-Z0-9 ]+$/);
  return pattern.test(txt)
}

function matchFullAscii(txt) {
  //
  const pattern=new RegExp(/^[A-Za-z0-9 ]+$/g);
  return pattern.test(txt)
}

function matchNotFullAscii(txt) {
  return !matchFullAscii(txt)
}

function matchHasSpace(txt) {
  const pattern=new RegExp(/\s/g);
  return pattern.test(txt)
}

function matchNoSpace(txt) {
  // const hasSpace =
  return !matchHasSpace(txt)
}

export default {isType, TEXT_TYPE};
