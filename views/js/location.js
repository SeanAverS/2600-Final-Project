(() => {
    // get the users current position
    function getUserLocation() {
        if (navigator.geolocation) {
            // use showPosition to display users coordinates
            navigator.geolocation.getCurrentPosition(showPosition);
        } else {
            console.log("Geolocation is not supported by this browser.");
        }
    }

    // handle the users current position
    function showPosition(position) {
        console.log("User Location: " + "Latitude = " + position.coords.latitude +
            ", Longitude = " + position.coords.longitude);
    }

    window.addEventListener('load', getUserLocation);
})()