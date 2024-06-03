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

  // filter out empty arrays
  const query = Object.keys(params)
    .filter(item => !Array.isArray(params[item]) || params[item].length > 0)
    .map(key => key + '=' + params[key]).join('&');

  return query;
}
