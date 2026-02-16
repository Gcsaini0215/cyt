import axios from "axios";
import { getToken } from "./jwt";

export const fetchById = (url, params = {}) => {
  return new Promise((resolve, reject) => {
    const token = getToken();
    axios
      .get(url, {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
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


export const deleteById = (url, params = {}) => {
  return new Promise((resolve, reject) => {
    const token = getToken();
    axios
      .delete(url, {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
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

export const fetchData = (url, params = {}) => {
  return new Promise((resolve, reject) => {
    axios
      .get(url, { params })
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        console.error("API Fetch Error:", url, error);
        reject(error);
      });
  });
};

export const postFormData = (url, formData) => {
  return new Promise((resolve, reject) => {
    const token = getToken();
    axios
      .post(url, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
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

export const postData = (url, data) => {
  return new Promise((resolve, reject) => {
    const token = getToken();
    axios
      .post(url, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        console.error("API Post Error:", url, error);
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

    axios
      .post(url, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/x-www-form-urlencoded",
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

export const postJsonData = (url, data) => {
  return new Promise((resolve, reject) => {
    const token = getToken();
    axios
      .post(url, data, {
        headers: {
          Authorization: `Bearer ${token}`,
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
