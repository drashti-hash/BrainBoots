import {
    loginUserApi,
    registerUserApi
} from "./api";


// REGISTER
export const registerUser = async (data) => {

    const response = await registerUserApi(data);

    return response.data;
};


// LOGIN
export const loginUser = async (data) => {

    const response = await loginUserApi(data);

    return response.data;
};
