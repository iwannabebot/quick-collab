import { NavigateFunction } from "react-router-dom";


export const getToken = (): string => {
    const auth = sessionStorage.getItem("auth");
    if (auth === null || auth === "" || !JSON.parse(auth) || !JSON.parse(auth).expiration || !JSON.parse(auth).token) {
        return "";
    } else {
        const expirationDate = new Date(JSON.parse(auth).expiration);
        const today = new Date();
        if (expirationDate < today) {
            return "";
        } else {
            return JSON.parse(auth).token;
        }
    }
    return "";
}

export const getTokenWithNav = (navigate: NavigateFunction): string => {
    const auth = sessionStorage.getItem("auth");
    if (auth === null || auth === "" || !JSON.parse(auth) || !JSON.parse(auth).expiration || !JSON.parse(auth).token) {
        navigate("/login", {
            state: {
                // eslint-disable-next-line no-restricted-globals
                from: location.pathname
            }
        });
    } else {
        const expirationDate = new Date(JSON.parse(auth).expiration);
        const today = new Date();
        if (expirationDate < today) {
            navigate("/login", {
                state: {
                    // eslint-disable-next-line no-restricted-globals
                    from: location.pathname
                }
            });
        } else {
            return JSON.parse(auth).token;
        }
    }
    return "";
}