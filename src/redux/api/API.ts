// Define the base URL
// export const API_BASE_URL = 'https://freshdealapi-fkfaajfaffh4c0ex.uksouth-01.azurewebsites.net/v1';
import axios from "axios";
import {logError, logRequest, logResponse} from "@/src/utils/logger";

export const API_BASE_URL = 'http://192.168.1.3:8000/v1';
// export const API_BASE_URL = 'https://freshdealbackend.azurewebsites.net/v1';
export const GET_UPLOADED_FILE_API_ENDPOINT = `${API_BASE_URL}/uploads`;


export const getUploadedFileAPI = async (filename: string): Promise<Blob> => {
    const functionName = 'getUploadedFileAPI';
    const endpoint = `${GET_UPLOADED_FILE_API_ENDPOINT}/${filename}`;

    logRequest(functionName, endpoint, {});

    try {
        const response = await axios.get(endpoint, {
            responseType: 'blob', // Important for binary data
        });
        logResponse(functionName, endpoint, response.data);
        return response.data;
    } catch (error: any) {
        logError(functionName, endpoint, error);
        throw error;
    }
};
