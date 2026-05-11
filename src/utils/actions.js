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
    axios
      .get(url, {
        params,
        headers,
        timeout: 10000,
      })
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
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
        timeout: 15000,
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
