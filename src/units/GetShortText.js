
function getShortText(txt) {
  if(txt.length < 12) {
    return txt;
  }
  return txt.substr(0,4) + '...' + txt.substr(txt.length - 4);
}

export default getShortText;
