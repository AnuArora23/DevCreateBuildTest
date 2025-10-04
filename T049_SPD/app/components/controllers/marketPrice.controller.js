import axios from "axios";
import asyncHandler from "../utils/asyncHandler.js";

const fetchEnamData = asyncHandler(async (req, res) => {
  const { stateName, apmcName, commodityName, fromDate, toDate } = req.body;

  const formData = {
    language: "en",
    stateName,
    apmcName,
    commodityName,
    fromDate,
    toDate,
  };

  const response = await axios.post(
    "https://enam.gov.in/web/Ajax_ctrl/trade_data_list",
    formData,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  const flattenedData = response.data.data.flat(Infinity);

  // Normal response without AppResponse wrapper
  return res.status(200).json({
    success: true,
    message: "Data fetched successfully",
    data: flattenedData,
  });
});

export { fetchEnamData };
