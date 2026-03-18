import app from "./app.js";

const PORT = 3000; //TODO: Make this an env variable.
app.listen(PORT, () => console.log(`Running on port ${PORT}`));