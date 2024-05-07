const express = require("express");
const cors = require("cors");
const axios = require("axios");
const config = require("./config/config");

const app = express();

app.use(cors());
app.use(express.static(config.ROOT));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Import homeController and memberController
const homeController = require(`${__dirname}/../controllers/homeController`);
const memberController = require(`${__dirname}/../controllers/memberController`);
app.use(homeController);
app.use(memberController);

// delete user endpoint
app.post('/deleteUser', (req, res) => {
    const deleteEmail = req.body.deleteEmail;
    res.json({ message: `User with email ${deleteEmail} deleted successfully.` });
});


// Endpoint to fetch nearby restaurants
app.get("/restaurants", async (req, res) => {
    try {
        const { latitude, longitude, keyword } = req.query;

        // Construct the query parameters for the Google Places API
        const params = {
            location: `${latitude},${longitude}`,
            radius: 5000,
            type: "restaurant",
            key: config.GOOGLE_PLACES_API_KEY
        };

        // If a keyword is provided, add it to the query parameters
        if (keyword) {
            params.keyword = keyword;
        }

        // Make a request to the Google Places API
        const response = await axios.get("https://maps.googleapis.com/maps/api/place/nearbysearch/json", { params });

        // Extract restaurant data from the response
        const restaurants = await Promise.all(response.data.results.map(async result => {
            // Fetch restaurant details including photos
            const detailsResponse = await axios.get("https://maps.googleapis.com/maps/api/place/details/json", {
                params: {
                    place_id: result.place_id,
                    fields: "name,vicinity,photos,rating,geometry",
                    key: config.GOOGLE_PLACES_API_KEY
                }
            });
        
            // Get the first photo of the place if available
            let imageUrl = '';
            if (detailsResponse.data.result.photos && detailsResponse.data.result.photos.length > 0) {
                const photoReference = detailsResponse.data.result.photos[0].photo_reference;
                imageUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${config.GOOGLE_PLACES_API_KEY}`;
            }
            const latitude = detailsResponse.data.result.geometry.location.lat;
            const longitude = detailsResponse.data.result.geometry.location.lng;
        
            return {
                name: detailsResponse.data.result.name,
                address: detailsResponse.data.result.vicinity,
                imageUrl: imageUrl,
                rating: detailsResponse.data.result.rating,
                latitude: latitude,
                longitude: longitude
            };
        }));
        

        // Respond with the list of nearby restaurants including image URLs
        res.json(restaurants);
    } catch (error) {
        console.error("Error fetching nearby restaurants:", error);
        res.status(500).json({ error: "Failed to fetch nearby restaurants" });
    }
});

// Start Node.js HTTP webapp
app.listen(config.PORT, "localhost", () => {
    console.log(`App listening on port ${config.PORT}`);
});
