import React, { createContext, useState } from 'react';
import api from './axios-api';

const AuthContext = createContext();

function AuthContextProvider(props) {
    const [auth, setAuth] = useState({
        user: null,
        loggedIn: false
    });

    auth.registerUser = async (formData) => {
        const response = await api.registerUser(formData)
        if(response.status === 200) {
            return response;
        }
        return response.response;
    }

    auth.loginUser = async ({email, password}) => {
        const response = await api.loginUser({ email, password });
        if(response.status === 200) {
            setAuth({
                user: response.data.user,
                loggedIn: true
            });
            return response;
        }
        return response.response;
    }

    auth.logoutUser = async () => {
        const response = await api.logoutUser();
        if(response.status === 200) {
            setAuth({
                user: null,
                loggedIn: false
            })
        }
    }

    return (
        <AuthContext.Provider value={{auth}}>
            {props.children}
        </AuthContext.Provider>
    );
}
export default AuthContext
export { AuthContextProvider };