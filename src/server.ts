import app from "./app";
import { envVars } from "./config/env";

const bootstrap = () => {
    try {
        // process.env.PORT can be used to set the port dynamically
        app.listen(envVars.PORT, () => {
            console.log(`Server is running on http://localhost:${envVars.PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
    }
}

bootstrap();