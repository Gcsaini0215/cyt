import { SESSION_STATUS } from "./constant";
import { formatDateTime } from "./time";

export const truncateString = (str, maxLength = 50) => {
  if (str.length <= maxLength) {
    return str;
  }
  return str.slice(0, maxLength - 3) + "...";
};

export const getMinMaxPrice = (fees) => {
  if (!fees || !Array.isArray(fees) || fees.length === 0) {
    return "--";
  }

  try {
    const feesArray = JSON.parse(JSON.stringify(fees));

    const allFees = feesArray
      .filter(f => f && f.formats && Array.isArray(f.formats))
      .map(f => f.formats
        .filter(fmt => fmt && typeof fmt.fee === 'number' && fmt.fee !== null)
        .map(fmt => fmt.fee)
      )
      .reduce((acc, val) => acc.concat(val), []);

    if (allFees.length > 0) {
      const minFee = Math.min(...allFees);
      const maxFee = Math.max(...allFees);
      return `₹${minFee} - ₹${maxFee}`;
    }
    else {
      return "--";
    }
  } catch (error) {
    console.error("Error in getMinMaxPrice:", error);
    return "--";
  }
};

export const getServices = async (fees = []) => {
  const validServices = fees
    .filter(service =>
      service.formats?.some(format => format.fee !== null)
    )
    .map(service => ({
      _id: service._id,
      name: service.name
    }));

  return validServices;
};

export const getValidServices = async (fees = []) => {
  const validServices = fees
    .filter(service =>
      service.formats?.some(format => format.fee !== null)
    ).map(service => ({
      _id: service._id,
      name: service.name,
      formats: service.formats.filter(format => format.fee !== null)
    }));
  return validServices;
};

export const getFormatsByServiceId = (fees, serviceId) => {
  const service = fees.find(s => s._id === serviceId);
  if (!service) return [];

  // return only formats with non-null fee
  return service.formats.filter(format => format.fee !== null);
};

export const getServiceFormats = (obj) => {
  let serviceOption = [];

  if (obj.icv !== "" || obj.ica !== "" || obj.icip !== "") {
    let formats = [];
    if (obj.icv !== "") {
      formats.push({ format: "Video Call", price: parseInt(obj.icv) });
    }
    if (obj.ica !== "") {
      formats.push({ format: "Audio Call", price: parseInt(obj.ica) });
    }
    if (obj.icip !== "") {
      formats.push({ format: "In Person-Call", price: parseInt(obj.icip) });
    }
    serviceOption.push({
      service: "Individual Counselling",
      formats: formats,
    });
  }

  if (obj.cca !== "" || obj.ccv !== "" || obj.ccip !== "") {
    let formats = [];
    if (obj.ccv !== "") {
      formats.push({ format: "Video Call", price: parseInt(obj.ccv) });
    }
    if (obj.cca !== "") {
      formats.push({ format: "Audio Call", price: parseInt(obj.cca) });
    }
    if (obj.ccip !== "") {
      formats.push({ format: "In Person-Call", price: parseInt(obj.ccip) });
    }
    serviceOption.push({
      service: "Couple Counselling",
      formats: formats,
    });
  }

  if (obj.tca !== "" || obj.tcv !== "" || obj.tcip !== "") {
    let formats = [];
    if (obj.tcv !== "") {
      formats.push({ format: "Video Call", price: parseInt(obj.tcv) });
    }
    if (obj.tca !== "") {
      formats.push({ format: "Audio Call", price: parseInt(obj.tca) });
    }
    if (obj.tcip !== "") {
      formats.push({ format: "In Person-Call", price: parseInt(obj.tcip) });
    }
    serviceOption.push({
      service: "Teen Counselling",
      formats: formats,
    });
  }

  return serviceOption;
};

export const getStatusColor = (status) => {
  let color = "bg-color-success-opacity color-success";
  if (status === SESSION_STATUS.COMPLETED || status === SESSION_STATUS.STARTED) {
    color = "bg-color-success-opacity color-success";
  }
  if (status === SESSION_STATUS.NEW) {
    color = "bg-color-warning-opacity color-warning";
  }
  if (status === SESSION_STATUS.CANCELED) {
    color = "bg-color-danger-opacity color-danger";
  }
  return color;

}

export const getDateTime = (item) => {
  let dateTime = "";
  if (item.status === SESSION_STATUS.COMPLETED) {
    dateTime =formatDateTime(item.session_completed_at);
  }
  if (item.status === SESSION_STATUS.NEW) {
    dateTime =formatDateTime(item.booking_date);
  }
  if (item.status === SESSION_STATUS.STARTED) {
    dateTime =formatDateTime(item.session_started_at);
  }
   if (item.status === SESSION_STATUS.CANCELED) {
    dateTime =formatDateTime(item.session_started_at);
  }
  return dateTime;

}
