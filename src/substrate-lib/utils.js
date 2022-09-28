import axios from "axios";
import config from "../config";

const utils = {
  paramConversion: {
    num: [
      'Compact<Balance>',
      'BalanceOf',
      'u8',
      'u16',
      'u32',
      'u64',
      'u128',
      'i8',
      'i16',
      'i32',
      'i64',
      'i128',
    ],
  },
  atoApiRequestInstance(){
    return axios.create({
      baseURL: config.API2_ATOCHA_URL,
      timeout: 120000,
      responseType: 'json',
      responseEncoding: 'utf8',
      withCredentials: true,
    })
  }
}

export default utils
