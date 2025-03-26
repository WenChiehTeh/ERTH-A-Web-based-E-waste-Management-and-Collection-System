import dotenv from "dotenv"; 

dotenv.config();
const googleMapsAPI = process.env.googleMapsAPI;

export async function validateAddress(address) {

    //load api key and url into memory
    const apiKey = googleMapsAPI;
    var url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

    //check for valid address
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.status === "OK") {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error("Error:", error);
        return false;
    }
}