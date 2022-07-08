// Commenting test out as it seems currently polkadot-js api is not compatible with jest
//   and will always cause `SyntaxError: Cannot use import statement outside a module`.
// See: https://github.com/polkadot-js/api/issues/3430

// import React from 'react';
// import ReactDOM from 'react-dom';
// import App from '../App';

import TextType from "../units/TextType";
import {assert} from "@polkadot/util";

describe('App Test Suite', () => {
  it('Test TextType', () => {
    // Check lowercase
    assert(true === TextType.isType("abc", TextType.TEXT_TYPE.FULL_LOWERCASE_WITH_NUMBER_SPACE), "TEXT_TYPE.FULL_LOWERCASE_WITH_NUMBER_SPACE")
    assert(true === TextType.isType("a b c", TextType.TEXT_TYPE.FULL_LOWERCASE_WITH_NUMBER_SPACE), "TEXT_TYPE.FULL_LOWERCASE_WITH_NUMBER_SPACE")
    assert(true === TextType.isType("abc123", TextType.TEXT_TYPE.FULL_LOWERCASE_WITH_NUMBER_SPACE), "TEXT_TYPE.FULL_LOWERCASE_WITH_NUMBER_SPACE")
    assert(true === TextType.isType("a b c 1 2 3", TextType.TEXT_TYPE.FULL_LOWERCASE_WITH_NUMBER_SPACE), "TEXT_TYPE.FULL_LOWERCASE_WITH_NUMBER_SPACE")
    assert(false === TextType.isType("abc123!", TextType.TEXT_TYPE.FULL_LOWERCASE_WITH_NUMBER_SPACE), "TEXT_TYPE.FULL_LOWERCASE_WITH_NUMBER_SPACE")
    assert(false === TextType.isType("abc123的", TextType.TEXT_TYPE.FULL_LOWERCASE_WITH_NUMBER_SPACE), "TEXT_TYPE.FULL_LOWERCASE_WITH_NUMBER_SPACE")
    assert(false === TextType.isType("abc123的!", TextType.TEXT_TYPE.FULL_LOWERCASE_WITH_NUMBER_SPACE), "TEXT_TYPE.FULL_LOWERCASE_WITH_NUMBER_SPACE")
    assert(false === TextType.isType("abc 123 的 !", TextType.TEXT_TYPE.FULL_LOWERCASE_WITH_NUMBER_SPACE), "TEXT_TYPE.FULL_LOWERCASE_WITH_NUMBER_SPACE")
    assert(false === TextType.isType("无英文", TextType.TEXT_TYPE.FULL_LOWERCASE_WITH_NUMBER_SPACE), "TEXT_TYPE.FULL_LOWERCASE_WITH_NUMBER_SPACE")
    assert(false === TextType.isType("aBc", TextType.TEXT_TYPE.FULL_LOWERCASE_WITH_NUMBER_SPACE), "TEXT_TYPE.FULL_LOWERCASE_WITH_NUMBER_SPACE")

    // Check uppercase
    assert(true === TextType.isType("ABC", TextType.TEXT_TYPE.FULL_UPPERCASE_WITH_NUMBER_SPACE), "TEXT_TYPE.FULL_UPPERCASE_WITH_NUMBER_SPACE")
    assert(true === TextType.isType("A B C", TextType.TEXT_TYPE.FULL_UPPERCASE_WITH_NUMBER_SPACE), "TEXT_TYPE.FULL_UPPERCASE_WITH_NUMBER_SPACE")
    assert(true === TextType.isType("ABC123", TextType.TEXT_TYPE.FULL_UPPERCASE_WITH_NUMBER_SPACE), "TEXT_TYPE.FULL_UPPERCASE_WITH_NUMBER_SPACE")
    assert(true === TextType.isType("A B C 1 2 3", TextType.TEXT_TYPE.FULL_UPPERCASE_WITH_NUMBER_SPACE), "TEXT_TYPE.FULL_UPPERCASE_WITH_NUMBER_SPACE")
    assert(false === TextType.isType("ABC123!", TextType.TEXT_TYPE.FULL_UPPERCASE_WITH_NUMBER_SPACE), "TEXT_TYPE.FULL_UPPERCASE_WITH_NUMBER_SPACE")
    assert(false === TextType.isType("ABC123的", TextType.TEXT_TYPE.FULL_UPPERCASE_WITH_NUMBER_SPACE), "TEXT_TYPE.FULL_UPPERCASE_WITH_NUMBER_SPACE")
    assert(false === TextType.isType("ABC123的!", TextType.TEXT_TYPE.FULL_UPPERCASE_WITH_NUMBER_SPACE), "TEXT_TYPE.FULL_UPPERCASE_WITH_NUMBER_SPACE")
    assert(false === TextType.isType("ABC 123 的 !", TextType.TEXT_TYPE.FULL_UPPERCASE_WITH_NUMBER_SPACE), "TEXT_TYPE.FULL_UPPERCASE_WITH_NUMBER_SPACE")
    assert(false === TextType.isType("无英文", TextType.TEXT_TYPE.FULL_UPPERCASE_WITH_NUMBER_SPACE), "TEXT_TYPE.FULL_UPPERCASE_WITH_NUMBER_SPACE")
    assert(false === TextType.isType("AbC", TextType.TEXT_TYPE.FULL_UPPERCASE_WITH_NUMBER_SPACE), "TEXT_TYPE.FULL_UPPERCASE_WITH_NUMBER_SPACE")


    // Check full ascii
    assert(true === TextType.isType("aBc123", TextType.TEXT_TYPE.FULL_ASCII), "TEXT_TYPE.FULL_ASCII")
    assert(true === TextType.isType("a B c 1 2 3", TextType.TEXT_TYPE.FULL_ASCII), "TEXT_TYPE.FULL_ASCII")
    assert(false === TextType.isType("aBc123!@#", TextType.TEXT_TYPE.FULL_ASCII), "TEXT_TYPE.FULL_ASCII")
    assert(false === TextType.isType("aBc1 2 3 !@#", TextType.TEXT_TYPE.FULL_ASCII), "TEXT_TYPE.FULL_ASCII")
    assert(false === TextType.isType("aB的12！3", TextType.TEXT_TYPE.FULL_ASCII), "TEXT_TYPE.FULL_ASCII")
    assert(false === TextType.isType("aB的123", TextType.TEXT_TYPE.FULL_ASCII), "TEXT_TYPE.FULL_ASCII")

    // Check not full ascii
    assert(true === TextType.isType("aBc的123", TextType.TEXT_TYPE.NOT_FULL_ASCII), "TEXT_TYPE.NOT_FULL_ASCII")
    assert(true === TextType.isType("aBc ! 123", TextType.TEXT_TYPE.NOT_FULL_ASCII), "TEXT_TYPE.NOT_FULL_ASCII")
    assert(false === TextType.isType("aBc123", TextType.TEXT_TYPE.NOT_FULL_ASCII), "TEXT_TYPE.NOT_FULL_ASCII")

    // Check have space
    assert(true === TextType.isType("aBc 123", TextType.TEXT_TYPE.HAS_SPACE), "TEXT_TYPE.HAS_SPACE")
    assert(true === TextType.isType("aBc 的 123", TextType.TEXT_TYPE.HAS_SPACE), "TEXT_TYPE.HAS_SPACE")
    assert(true === TextType.isType("aBc ! 123", TextType.TEXT_TYPE.HAS_SPACE), "TEXT_TYPE.HAS_SPACE")
    assert(false === TextType.isType("aBc123", TextType.TEXT_TYPE.HAS_SPACE), "TEXT_TYPE.HAS_SPACE")

    // Check not have space
    assert(false === TextType.isType("aBc 123", TextType.TEXT_TYPE.NO_SPACE), "TEXT_TYPE.NO_SPACE 1")
    assert(false === TextType.isType("aBc 的 123", TextType.TEXT_TYPE.NO_SPACE), "TEXT_TYPE.NO_SPACE 2")
    assert(false === TextType.isType("aBc ! 123", TextType.TEXT_TYPE.NO_SPACE), "TEXT_TYPE.NO_SPACE")
    assert(true === TextType.isType("aBc123", TextType.TEXT_TYPE.NO_SPACE), "TEXT_TYPE.NO_SPACE")
    assert(true === TextType.isType("aBc123!@#", TextType.TEXT_TYPE.NO_SPACE), "TEXT_TYPE.NO_SPACE")
    assert(true === TextType.isType("aBc123无空格", TextType.TEXT_TYPE.NO_SPACE), "TEXT_TYPE.NO_SPACE")

  })
})
