import { Platform } from 'react-native';
import axios from 'axios';

const LOCAL_API_URL = Platform.select({
    android: "http://192.168.100.39:3000/api",
    ios: "http://192.168.100.39:3000/api",
    default: "http://localhost:3000/api"
})

const api = axios.create({
    baseURL: LOCAL_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;