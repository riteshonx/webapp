import axios from 'axios';
import jwt_decode from 'jwt-decode';

import {
  getExchangeToken,
  getProjectExchangeToken,
  getToken,
  logout,
  decodeToken,
  setToken,
  setExchangeToken,
} from './authservice';

import {
  ExchangeToken,
  exchangeTokenFeatures,
} from 'src/modules/authentication/utils';

export const axiosApiInstance = axios.create();

// Request interceptor for API calls

axiosApiInstance.interceptors.request.use(
  async (config: any) => {
    let tokenStr = '';
    if (config.headers.token === 'token') {
      tokenStr = getToken();
    }
    if (config.headers.token === 'exchange') {
      tokenStr = getExchangeToken();
    }
    if (config.headers.token === 'project') {
      tokenStr = config?.headers?.tokenString
        ? config.headers.tokenString
        : getProjectExchangeToken();
    }
    if (config.headers.token === 'queryToken') {
      tokenStr = config?.headers?.tokenString;
    }
    config.headers = {
      Authorization: `Bearer ${tokenStr}`,
      'Content-Type': 'application/json',
    };
    return config;
  },
  (error: any) => {
    Promise.reject(error);
  }
);

// Response interceptor for API calls
axiosApiInstance.interceptors.response.use(
  async (response: any) => {
    try {
      const authTokenValue = localStorage.getItem('token');
      const expTime = decodeToken(authTokenValue as string).exp;
      if (new Date().valueOf() > expTime * 1000 - 10 * 60 * 1000) {
        const res = await fetch(
          `${process.env['REACT_APP_AUTHENTICATION_URL']}V1/user/login/refresh`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        const authToken = await res.json();
        setToken(authToken.success);
      }
    } catch (e) {
      console.log(e);
    }

    try {
      const exchangeTokenValue = localStorage.getItem('exchange');
      const expTime = decodeToken(exchangeTokenValue as string).exp;
      if (new Date().valueOf() > expTime * 1000 - 10 * 60 * 1000) {
        const exchangeTokenBody: ExchangeToken = {
          tenantId: Number(decodeToken().tenantId),
          features: exchangeTokenFeatures,
        };
        const res = await fetch(
          `${process.env['REACT_APP_AUTHENTICATION_URL']}V1/user/login/exchange`,
          {
            method: 'POST',
            body: JSON.stringify(exchangeTokenBody),
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        const exchangeToken = await res.json();
        setToken(exchangeToken.success);
      }
    } catch (e) {
      console.log(e);
    }
    return response;
  },
  async function (error) {
    const originalConfig = error.config;
    if (originalConfig.url !== '/login' && error.response) {
      if (error.response?.status === 401) {
        logout();
      }
    }
  }
);

/**
 * Method to refetch token on token expiry
 */
export async function refreshAccessToken(): Promise<any> {
  return axios
    .post(`${process.env['REACT_APP_AUTHENTICATION_URL']}V1/user/login`)
    .then((response: { data: any }) => {
      const data = response.data;
      return data;
    })
    .catch((error: string | undefined) => {
      throw new Error(error);
    });
}

/**
 * Common Get method
 * @param {*} url : string
 */
export async function getApi(url: string): Promise<any> {
  return axiosApiInstance
    .get(`${process.env['REACT_APP_AUTHENTICATION_URL']}${url}`)
    .then((response: { data: any }) => {
      const data = response.data;
      return data;
    })
    .catch((error: string | undefined) => {
      throw new Error(error);
    });
}

/**
 * Common API to Create an Entity / common post API
 * @param {*} url : string
 * @param {*} argBody : Object
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export async function postApi(url: string, argBody?: any): Promise<any> {
  try {
    const response = await axiosApiInstance.post(
      `${process.env['REACT_APP_AUTHENTICATION_URL']}${url}`,
      argBody,
      {
        headers: {
          token: 'token',
        },
      }
    );
    const data = response.data;
    return data;
  } catch (error: any) {
    throw error;
  }
}

/**
 * Common API to Create an Entity / common post API
 * @param {*} url : string
 * @param {*} argBody : Object
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export async function postApiWithEchange(
  url: string,
  argBody: any
): Promise<any> {
  try {
    const response = await axiosApiInstance.post(
      `${process.env['REACT_APP_AUTHENTICATION_URL']}${url}`,
      argBody,
      {
        headers: {
          token: 'exchange',
        },
      }
    );
    const data = response.data;
    return data;
  } catch (error: any) {
    throw new Error(error);
  }
}

/**
 * Common API to Create an Entity / common post API
 * @param {*} url : string
 * @param {*} argBody : Object
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export async function postApiWithProjectExchange(
  url: string,
  argBody: any,
  argToken: any
): Promise<any> {
  try {
    const response = await axiosApiInstance.post(
      `${process.env['REACT_APP_AUTHENTICATION_URL']}${url}`,
      argBody,
      {
        headers: {
          token: 'project',
          tokenString: argToken,
        },
      }
    );
    const data = response.data;
    return data;
  } catch (error: any) {
    throw new Error(error);
  }
}

/**
 * Common API to Create an Entity / common post API
 * @param {*} url : string
 * @param {*} argBody : Object
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export async function postSchedulerApiWithProjectExchange(
  url: string,
  argBody: any,
  argToken: any
): Promise<any> {
  try {
    const response = await axiosApiInstance.post(
      `${process.env['REACT_APP_SCHEDULER_URL']}${url}`,
      argBody,
      {
        headers: {
          token: 'project',
          Authorization: argToken,
          tokenString: argToken,
        },
      }
    );
    const data = response.data;
    return data;
  } catch (error: any) {
    throw new Error(error);
  }
}

export async function getApiWithExchange(url: string): Promise<any> {
  try {
    const response = await axiosApiInstance.get(
      `${process.env['REACT_APP_AUTHENTICATION_URL']}${url}`,
      {
        headers: {
          token: 'exchange',
        },
      }
    );
    const data = response.data;
    return data;
  } catch (error: any) {
    throw new Error(error);
  }
}

export async function deleteApiWithEchange(url: string): Promise<any> {
  try {
    const response = await axiosApiInstance.delete(
      `${process.env['REACT_APP_SCHEDULER_URL']}${url}`,
      {
        headers: {
          token: 'exchange',
        },
      }
    );
    const data = response.data;
    return data;
  } catch (error: any) {
    throw new Error(error.response.data.error);
  }
}

// Method for delete operating using axios with payload

export async function deleteRequestWithPayload(
  url: string,
  payload: any
): Promise<any> {
  const token = getExchangeToken();
  try {
    const response = await axios.delete(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      data: payload,
    });
    return response;
  } catch (error: any) {
    throw new Error(error.response.data.error);
  }
}

export async function deleteApiSchedulerWithPayload(
  url: string,
  payload: any
): Promise<any> {
  const token = getProjectExchangeToken();
  try {
    const response = await axios.delete(
      `${process.env['REACT_APP_SCHEDULER_URL']}${url}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data: payload,
      }
    );
    return response;
  } catch (error: any) {
    throw new Error(error.response.data.error);
  }
}

export async function putApiScheduler(
  url: string,
  payload?: any
): Promise<any> {
  const token = getProjectExchangeToken();
  try {
    const response = await axios.put(
      `${process.env['REACT_APP_SCHEDULER_URL']}${url}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response;
  } catch (error: any) {
    throw new Error(error.response.data.error);
  }
}

export async function getApiSchedulerWithExchange(url: string): Promise<any> {
  try {
    const response = await axiosApiInstance.get(
      `${process.env['REACT_APP_SCHEDULER_URL']}${url}`,
      {
        headers: {
          token: 'project',
        },
      }
    );
    const data = response.data;
    return data;
  } catch (error: any) {
    throw new Error(error);
  }
}

export async function patchApiSchedulerWithEchange(
  url: string,
  argBody: any
): Promise<any> {
  try {
    const response = await axiosApiInstance.patch(
      `${process.env['REACT_APP_SCHEDULER_URL']}${url}`,
      argBody,
      {
        headers: {
          token: 'project',
        },
      }
    );
    const data = response.data;
    return data;
  } catch (error: any) {
    throw new Error(error);
  }
}

// Method to login user
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export async function login(requestBody: any): Promise<any> {
  return axios
    .post(
      `${process.env['REACT_APP_AUTHENTICATION_URL']}V1/user/login`,
      requestBody
    )
    .then((response: { data: any }) => {
      const data = response;
      return data;
    })
    .catch((error: string | undefined) => {
      console.log(error);
      throw error;
    });
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export async function multiPartPost(
  url: string,
  argCredentials: any,
  argFile: any,
  config: any
): Promise<any> {
  try {
    const headers = {
      'content-type': 'multipart/form-data',
    };

    const formData = new FormData();
    formData.append('Policy', argCredentials['Policy']);
    formData.append('X-Amz-Algorithm', argCredentials['X-Amz-Algorithm']);
    formData.append('X-Amz-Credential', argCredentials['X-Amz-Credential']);
    formData.append('X-Amz-Date', argCredentials['X-Amz-Date']);
    formData.append('X-Amz-Signature', argCredentials['X-Amz-Signature']);
    formData.append('bucket', argCredentials['bucket']);
    formData.append('key', argCredentials['key']);
    argCredentials['x-amz-meta-references'] &&
      formData.append(
        'X-Amz-Meta-References',
        argCredentials['x-amz-meta-references']
      );
    formData.append('file', argFile);
    return axios
      .post(url, formData, config)
      .then((res) => res)
      .catch((err) => Promise.reject(err));
  } catch (error: any) {
    throw new Error(error);
  }
}

/**
 * Common Get method
 * @param {*} url : string
 */
export async function getApiCDP(url: string): Promise<any> {
  console.log(process.env)
  return axiosApiInstance
    .get(`${process.env['REACT_APP_DVASCRIPT_URL']}${url}`, {
      headers: {
        token: 'exchange',
      },
    })
    .then((response: { data: any }) => {
      const data = response.data;
      return data;
    })
    .catch((error: string | undefined) => {
      throw new Error(error);
    });
}

/**
 * Common Post method
 * @param {*} url : string
 */
export async function postApiCDP(url: string, body: any): Promise<any> {
  console.log(process.env)
  return axiosApiInstance
    .post(`${process.env['REACT_APP_DVASCRIPT_URL']}${url}`, body, {
      headers: {
        token: 'exchange',
      },
    })
    .then((response: { data: any }) => {
      const data = response.data;
      return data;
    })
    .catch((error: string | undefined) => {
      throw new Error(error);
    });
}

/**
 * Common Put method
 * @param {*} url : string
 */
export async function putApiCDP(url: string, body: any): Promise<any> {
  console.log(process.env)
  return axiosApiInstance
    .put(`${process.env['REACT_APP_DVASCRIPT_URL']}${url}`, body, {
      headers: {
        token: 'exchange',
      },
    })
    .then((response: { data: any }) => {
      const data = response.data;
      return data;
    })
    .catch((error: string | undefined) => {
      throw new Error(error);
    });
}