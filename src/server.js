import "dotenv/config";
import app from "./app.js";

app.listen(process.env.PORT, () => {
    console.log('listen port: ' + process.env.PORT);
});