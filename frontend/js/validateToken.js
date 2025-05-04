async function validateToken() {
    const token = localStorage.getItem("authToken");

    if (!token) {
        return false;
    }

    try {
        const response = await fetch("/api/users/validate-token", {
            method: "GET",
            headers: {
                "x-auth-token": token,
            },
        });

        const data = await response.json();
        return data.success;
    } catch (error) {
        console.error("Error al validar token:", error);
        return false;
    }
}
