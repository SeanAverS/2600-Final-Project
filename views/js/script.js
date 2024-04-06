// using IIFE
(() => {
    //----------------------------------------------------
    const navigation = {
        home: { title: "Home Page", url: "Home", section: "Home" },
        about: { title: "About Page", url: "About", section: "About" },
        posts: { title: "Member Page", url: "Member/Posts", section: "Posts" },
        search: { title: "Member Page", url: "Member/Search", section: "Search Posts" },
        orders: { title: "Orders", url: "Orders", section: "Orders" },
        users: { title: "Admin Page", url: "Admin/Users", section: "Manage Users" },
        content: { title: "Admin Page", url: "Admin/Content", section: "Manage Content" },
        register: { title: "Register Page", url: "Account/Register", section: "Register" },
        login: { title: "Login Page", url: "Account/Login", section: "Login" }
    }
    const registerWarning = document.querySelector('#Register div[name="error"]')
    const loginWarning = document.querySelector('#Login div[name="error"]')
    let email = undefined
    //----------------------------------------------------
    /**
     * Utility functions
    */
    //----------------------------------------------------
    const getJSONData = async (url) => {
        const response = await fetch(url)
        const data = await response.json()
        return data
    }
    const postData = async (url = '', data = {}) => {
        console.log("url", url)
        // Default options are marked with *
        const response = await fetch(url, {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, *same-origin, omit
            headers: {
                'Content-Type': 'application/json'
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            redirect: 'follow', // manual, *follow, error
            referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: JSON.stringify(data) // body data type must match "Content-Type" header
        })
        return response.json(); // parses JSON response into native JavaScript objects
    }
    const hide = (element) => element.style.display = 'none'
    const show = (element) => element.style.display = 'block'
    const setCopyrightYear = () => {
        document.querySelector('#footer kbd span').innerHTML = new Date().getFullYear()
    }
    //----------------------------------------------------
    /**
     * Client-side RESTful APIs
     *  
     */
    //----------------------------------------------------
    const signup = async (event) => {
        // prevent refreshing the page
        event.preventDefault()
        window.history.pushState(navigation.register, "", `/${navigation.register.url}`);
    displaySection(navigation.register);
        
        email = document.querySelector('#Register input[name="email"]').value
        let password = document.querySelector('#Register input[name="password"]').value
        let confirm = document.querySelector('#confirm').value
        console.log(email, password, confirm)

        if (password == confirm) {
            const reply = await postData('/signup', { email, password })
            if (reply.error) {
                registerWarning.innerHTML = `${reply.error}`
                show(registerWarning)
            }
            else if (reply.success) {
                console.log(reply, reply)
                window.history.pushState(navigation.posts, "", `/${navigation.posts.url}`)
                displaySection(navigation.posts)
                authorize(true)
                document.querySelector('[data-authenticated] > span').innerHTML = `Welcome ${email}!`
            }
        }
        else {
            registerWarning.innerHTML = 'Passwords do not match. Re-enter your password'
            show(registerWarning)
        }
    }

    document.querySelector("#signup").onclick = signup;
    const signout = async (event) => {
        event.preventDefault()
        console.log(email)
        const reply = await postData('/signout', { email })
        if (reply.success) {
            console.log('inside signout')
            console.log(reply.success)
            console.log(reply, reply)
            window.history.pushState(navigation.posts, "", `/${navigation.posts.url}`)
            displaySection(navigation.posts)
            authorize(false)
        } else {
            console.log(reply)
        }
    }
    const signin = async (event) => {
        event.preventDefault()
        email = document.querySelector('#Login input[name="email"]').value
        console.log(email)
        let password = document.querySelector('#Login input[name="password"]').value
        const reply = await postData('/signin', { email, password })
        if (reply.error) {
            loginWarning.innerHTML = `${reply.error}`
            show(loginWarning)
        }
        else if (reply.success) {
            console.log(reply, reply)
            window.history.pushState(navigation.posts, "", `/${navigation.posts.url}`)
            displaySection(navigation.posts)
            authorize(true)
            document.querySelector('[data-authenticated] > span').innerHTML = `Welcome ${email}!`
        }
    }

    const setActivePage = (section) => {
        console.log(section)
        let menuItems = document.querySelectorAll('a[data-page]')
        menuItems.forEach(menuItem => {
            if (section === menuItem.textContent)
                menuItem.classList.add("active")
            else
                menuItem.classList.remove("active")
        })
    }
    const displaySection = (state) => {
        console.log(state)
        const sections = document.querySelectorAll('section')
        sections.forEach(section => {
            let name = section.getAttribute('id')
            if (name === state.section) {
                document.title = state.title
                show(section)
                setActivePage(name)
            }
            else
                hide(section)
        })
    }
    const authorize = (isAuthenticated) => {
        const authenticated = document.querySelectorAll('[data-authenticated]')
        const nonAuthenticated = document.querySelector('[data-nonAuthenticated]')
        if(isAuthenticated) { 
            authenticated.forEach(element => show(element))
            hide(nonAuthenticated)
        }
        else {
            authenticated.forEach(element => hide(element))
            show(nonAuthenticated)
        }
    }
    // Handle forward/back buttons
    window.onpopstate = (event) => {
        // If a state has been provided, we have a "simulated" page
        // and we update the current page.
        if (event.state) {
            // Simulate the loading of the previous page
            displaySection(event.state)
        }
    }
    document.addEventListener("DOMContentLoaded", () => {
        displaySection(navigation.home)
        window.history.replaceState(navigation.home, "", document.location.href);
        setCopyrightYear()
        document.onclick = (event) => {
            const page = event.target.getAttribute('data-page')
            if (page) {
                event.preventDefault()
                window.history.pushState(navigation[page], "", `/${navigation[page].url}`)
                displaySection(navigation[page])
            }
        }
        authorize(false)
        const noticeDialog = document.querySelector("#noticeDialog")
        const errors = document.querySelectorAll('section div[name="error"]')
        errors.forEach(error => hide(error))
        
        noticeDialog.showModal()
        document.querySelector("#noticeButton").onclick = (event) => {
            event.preventDefault()
            if (document.querySelector("#agree").checked)
                noticeDialog.close()
        }
        document.querySelector("#signup").onclick = signup
        document.querySelector("#signout").onclick = signout
        document.querySelector("#signin").onclick = signin

    // Fetch nearby restaurants using user's current location
        fetchNearbyRestaurants();
    })
    //----------------------------------------------------

    async function fetchNearbyRestaurants(latitude, longitude) {
        try {
            // Fetch nearby restaurants from the server using latitude and longitude
            const response = await fetch(`/restaurants?latitude=${latitude}&longitude=${longitude}`);
            const data = await response.json();
            // Call the updateCardComponent function to display the fetched restaurants
            updateCardComponent(data);
        } catch (error) {
            console.error("Error fetching nearby restaurants:", error);
            // Handle error
        }
    }
    async function fetchRandomFoodImage() {
        const response = await fetch('https://source.unsplash.com/featured/?food');
        return response.url;
    }

    // Define the updateCardComponent function to create cards for restaurant data
  // Function to update the card component with restaurant data
async function updateCardComponent(restaurants) {
    const cardContainer = document.getElementById('cardContainer');
    cardContainer.innerHTML = ''; // Clear previous cards
    // Iterate over the fetched restaurant data and create card elements
    for (const restaurant of restaurants) {
        const card = document.createElement('div');
        card.classList.add('cardHome');
        const restaurantName = restaurant.name;
        const imageUrl = await fetchRandomFoodImage();
        card.innerHTML = `
            <img src="${imageUrl}" alt="${restaurantName} Image">
            <div class="card-content">
                <h4>${restaurantName}</h4>
                <p>${restaurant.address}</p>
                <p class="description">${restaurant.description}</p>
            </div>
        `;
        cardContainer.appendChild(card);
    }
}


    // Function to get the user's current location and fetch nearby restaurants
    function getUserLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                // Call fetchNearbyRestaurants with obtained latitude and longitude
                fetchNearbyRestaurants(latitude, longitude);
            }, (error) => {
                console.error("Error getting user location:", error);
                // Handle error
            });
        } else {
            console.log("Geolocation is not supported by this browser.");
            // Handle error
        }
    }

    // Call getUserLocation when the page loads to fetch nearby restaurants
    window.addEventListener('load', getUserLocation);

    const foodIconsContainer = document.querySelector('.food-icons-container');
  const navArrows = document.querySelectorAll('.nav-arrow');

  // Add event listeners to navigation arrows
  navArrows.forEach(arrow => {
    arrow.addEventListener('click', () => {
      const direction = arrow.classList.contains('left') ? -1 : 1;
      foodIconsContainer.scrollBy({
        left: direction * (foodIconsContainer.offsetWidth / 2),
        behavior: 'smooth'
      });
    });
  });
  
    
})()
