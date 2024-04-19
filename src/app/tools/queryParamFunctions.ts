export function decodeQueryParams(search: string) {
  if(search.length == 0) {
    return {};
  }

  const object = JSON.parse('{"' + decodeURI(search.replace(/&/g, "\",\"").replace(/=/g,"\":\"")) + '"}');

  return object;
}

export function encodeQueryParams(params: any): string | null {
  if(!params || params?.length == 0) {
    return null;
  }

  let query = Object.keys(params).map(key => key + '=' + params[key]).join('&');

  return query;
}
