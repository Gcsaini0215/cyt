import axios from "axios";
import { getToken } from "./jwt";

export const fetchById = (url, params = {}) => {
  return new Promise((resolve, reject) => {
    const token = getToken();
    const headers = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    axios
      .get(url, {
        params,
        headers,
      })
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};


export const deleteById = (url, params = {}) => {
  return new Promise((resolve, reject) => {
    const token = getToken();
    const headers = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    axios
      .delete(url, {
        params,
        headers,
      })
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

export const fetchData = (url, params = {}) => {
  return new Promise((resolve, reject) => {
    const token = getToken();
    const headers = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    console.log("Fetching data from:", url, "with params:", params);
    axios
      .get(url, { 
        params,
        headers,
        timeout: 10000 // 10 seconds timeout
      })
      .then((response) => {
        console.log(`Response received from ${url}:`, {
          status: response.status,
          dataType: typeof response.data,
          dataLength: Array.isArray(response.data) ? response.data.length : (response.data?.data ? response.data.data.length : 'N/A')
        });
        resolve(response.data);
      })
      .catch((error) => {
        console.error("API Fetch Error:", url);
        if (error.response) {
          console.error("- Status:", error.response.status);
          console.error("- Data:", error.response.data);
        } else if (error.request) {
          console.error("- No response received. Possible CORS issue or Network error.");
        } else {
          console.error("- Message:", error.message);
        }
        reject(error);
      });
  });
};

export const postFormData = (url, formData) => {
  return new Promise((resolve, reject) => {
    const token = getToken();
    const headers = {
      "Content-Type": "multipart/form-data",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    axios
      .post(url, formData, {
        headers,
      })
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

export const postData = (url, data) => {
  return new Promise((resolve, reject) => {
    const token = getToken();
    const headers = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    axios
      .post(url, data, {
        headers,
      })
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        if (error.response?.status !== 429) {
          console.error("API Post Error:", url, error);
        }
        reject(error);
      });
  });
};

export const postFormUrlEncoded = (url, data) => {
  return new Promise((resolve, reject) => {
    const token = getToken();
    const formData = new URLSearchParams();
    Object.keys(data).forEach(key => {
      formData.append(key, data[key]);
    });

    const headers = {
      "Content-Type": "application/x-www-form-urlencoded",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    axios
      .post(url, formData, {
        headers,
      })
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

export const postJsonData = (url, data) => {
  return new Promise((resolve, reject) => {
    const token = getToken();
    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    axios
      .post(url, data, {
        headers,
      })
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

export const postJsonDataNoAuth = (url, data) => {
  return new Promise((resolve, reject) => {
    axios
      .post(url, data, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

export const putData = (url, data) => {
  return new Promise((resolve, reject) => {
    const token = getToken();
    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    axios
      .put(url, data, {
        headers,
      })
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        console.error("API Put Error:", url, error);
        reject(error);
      });
  });
};
