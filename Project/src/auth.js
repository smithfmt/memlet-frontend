import moment from "moment";

export const setLocalStorage = (res) => {
    const response = res.data;
    const expires = moment().add(response.expiresIn);
    localStorage.setItem("token", response.token);
    localStorage.setItem("expires", JSON.stringify(expires.valueOf()));
};

export const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("expires");
};

export const getExpiration = () => {
    const expiration = JSON.parse(localStorage.getItem("expires"));
    return moment(expiration);
};

export const isLoggedIn = () => {
    return moment().isBefore(getExpiration());
};

export const isLoggedOut = () => {
    return !isLoggedIn();
};