const TWITTER_STATE = "twitter-increaser-state";
const TWITTER_CODE_CHALLENGE = "challenge";
const TWITTER_AUTH_URL = "https://twitter.com/i/oauth2/authorize";
const TWITTER_SCOPE = ["tweet.read", "users.read", "offline.access"].join(" ");

export const getURLWithQueryParams = (
  baseUrl: string,
  params: Record<string, any>
) => {
  const width = 600,
    height = 600;
  const left = window.innerWidth / 2 - width / 2;
  const top = window.innerHeight / 2 - height / 2;
  const query = Object.entries(params)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");
  console.log("query", query);
  const url = `${baseUrl}?${query}`;
  //   return `${baseUrl}?${query}`;
  return window.open(
    url,
    "",
    `toolbar=no, location=no, directories=no, status=no, menubar=no, 
  scrollbars=no, resizable=no, copyhistory=no, width=${width}, 
  height=${height}, top=${top}, left=${left}`
  );
};

export const getTwitterOAuthUrl = (redirectUri: string) => {
  const popup = getURLWithQueryParams(TWITTER_AUTH_URL, {
    response_type: "code",
    client_id: "YXBNZEVxYmxFbl9YeVNYbF9MbXM6MTpjaQ",
    redirect_uri: redirectUri,
    scope: TWITTER_SCOPE,
    state: TWITTER_STATE,

    code_challenge: TWITTER_CODE_CHALLENGE,
    code_challenge_method: "plain",
  });
  console.log("popup", popup);
  //   popup?.close();
};
