
function getShortText(txt) {
  if(txt.length < 24) {
    return txt;
  }
  return txt.substr(0,10) + '...' + txt.substr(txt.length - 10);
}

export default getShortText;
