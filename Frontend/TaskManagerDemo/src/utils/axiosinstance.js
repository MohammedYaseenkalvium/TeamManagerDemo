// import axios from  "axios";
// import { BASE_URL } from "./apiPath";

// const axiosInstance = axios.create({
//     baseURL:BASE_URL,
//     timeout:1000,
//     headers:{
//         "Content-Type":"application/json",
//         Accept:"application/json",

//     },
// });

// //Request Interceptor
// axiosInstance.interceptors.request.use(
//     (config)=>{
//         const accessToken = localStorage.getItem("token");
//         if (accessToken){
//             config.headers.Authorization=`Bearer ${accessToken}`;
//         }
//         return config;
//     },
//     (error)=>{
//         return Promise.reject(error);
//     }
// );

// //Response Interceptor
// axiosInstance.interceptors.response.use