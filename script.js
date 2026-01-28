// Sample disaster relief resources data (Dahanu and Palghar, Maharashtra, India)
const resources = [
    { name: "Dahanu Community Shelter", type: "Shelter", lat: 19.97, lng: 72.73, address: "Main Road, Dahanu, Maharashtra" },
    { name: "Palghar Food Distribution Center", type: "Food", lat: 19.69, lng: 72.77, address: "Station Road, Palghar, Maharashtra" },
    { name: "Dahanu Medical Camp", type: "Medical", lat: 19.95, lng: 72.75, address: "Near Bus Stand, Dahanu, Maharashtra" },
    { name: "Palghar Water Supply Point", type: "Water", lat: 19.71, lng: 72.79, address: "Market Area, Palghar, Maharashtra" },
    { name: "Dahanu Relief Supplies Depot", type: "Supplies", lat: 19.99, lng: 72.71, address: "Industrial Area, Dahanu, Maharashtra" }
];

let map;
let markers = [];

function initMap() {
    // Initialize Leaflet map centered on Dahanu and Palghar, Maharashtra, India
    map = L.map('map').setView([19.83, 72.75], 11);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add markers for sample resources
    addResourceMarkers();

    // Set up search functionality
    setupSearch();
}

function addResourceMarkers() {
    resources.forEach(resource => {
        const marker = L.marker([resource.lat, resource.lng]).addTo(map);

        const popup = L.popup()
            .setContent(`<div><strong>${resource.name}</strong><br>Type: ${resource.type}<br>Address: ${resource.address}</div>`);

        marker.bindPopup(popup);

        markers.push(marker);
    });

    updateResourceList(resources);
}

function setupSearch() {
    const searchBtn = document.getElementById('search-btn');
    const locationInput = document.getElementById('location-input');
    const currentLocationBtn = document.getElementById('current-location-btn');

    searchBtn.addEventListener('click', () => {
        const query = locationInput.value;
        if (query) {
            showSpinner();
            searchResources(query);
        }
    });

    locationInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchBtn.click();
        }
    });

    currentLocationBtn.addEventListener('click', () => {
        showSpinner();
        getCurrentLocation();
    });
}

function searchResources(query) {
    console.log('Searching for:', query);
    // Clear existing markers
    clearMarkers();

    // Use Nominatim API for geocoding
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;

    fetch(nominatimUrl)
        .then(response => response.json())
        .then(data => {
            hideSpinner();
            if (data && data.length > 0) {
                const result = data[0];
                const lat = parseFloat(result.lat);
                const lng = parseFloat(result.lon);

                // Center map on search result
                map.setView([lat, lng], 14);

                // Add a marker for the search result
                const searchMarker = L.marker([lat, lng]).addTo(map);
                const popup = L.popup()
                    .setContent(`<div><strong>Search Result</strong><br>${result.display_name}</div>`);
                searchMarker.bindPopup(popup);
                markers.push(searchMarker);

                // Find nearby resources within 10km
                const nearbyResources = resources.filter(resource => {
                    const distance = getDistance(lat, lng, resource.lat, resource.lng);
                    return distance <= 10; // 10km
                });

                // Add markers for nearby resources
                nearbyResources.forEach(resource => {
                    const marker = L.marker([resource.lat, resource.lng]).addTo(map);
                    const popup = L.popup()
                        .setContent(`<div><strong>${resource.name}</strong><br>Type: ${resource.type}<br>Address: ${resource.address}</div>`);
                    marker.bindPopup(popup);
                    markers.push(marker);
                });

                updateResourceList(nearbyResources);
            } else {
                alert('Location not found. Showing all available resources.');
                addResourceMarkers();
            }
        })
        .catch(error => {
            console.error('Error searching:', error);
            hideSpinner();
            alert('Search failed. Showing all available resources.');
            addResourceMarkers();
        });
}

function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            hideSpinner();
            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;

            map.setView([userLat, userLng], 14);

            // Find nearby resources within 10km (using simple distance calculation)
            const nearbyResources = resources.filter(resource => {
                const distance = getDistance(userLat, userLng, resource.lat, resource.lng);
                return distance <= 10; // 10km
            });

            clearMarkers();
            nearbyResources.forEach(resource => {
                const marker = L.marker([resource.lat, resource.lng]).addTo(map);

                const popup = L.popup()
                    .setContent(`<div><strong>${resource.name}</strong><br>Type: ${resource.type}<br>Address: ${resource.address}</div>`);

                marker.bindPopup(popup);

                markers.push(marker);
            });

            updateResourceList(nearbyResources);
        }, () => {
            hideSpinner();
            alert('Unable to retrieve your location. Please enable location services.');
        });
    } else {
        hideSpinner();
        alert('Geolocation is not supported by this browser.');
    }
}

// Simple distance calculation function (Haversine formula)
function getDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance;
}

function clearMarkers() {
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
}

function updateResourceList(resourceList) {
    const resourceUl = document.getElementById('resources');
    resourceUl.innerHTML = '';

    resourceList.forEach(resource => {
        const li = document.createElement('li');
        const iconClass = getResourceIcon(resource.type);
        li.innerHTML = `<i class="${iconClass}"></i><strong>${resource.name}</strong> (${resource.type})<br>${resource.address}`;
        resourceUl.appendChild(li);
    });
}

function getResourceIcon(type) {
    const iconMap = {
        'Shelter': 'fas fa-home',
        'Food': 'fas fa-utensils',
        'Medical': 'fas fa-hospital',
        'Water': 'fas fa-tint',
        'Supplies': 'fas fa-box',
        'Search Result': 'fas fa-search-location'
    };
    return iconMap[type] || 'fas fa-map-marker-alt';
}

function showSpinner() {
    const spinner = document.getElementById('loading-spinner');
    spinner.classList.remove('hidden');
}

function hideSpinner() {
    const spinner = document.getElementById('loading-spinner');
    spinner.classList.add('hidden');
}

// Single-page navigation
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.page-section').forEach(section => {
        section.classList.remove('active');
    });

    // Show the selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        targetSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Handle navigation clicks
function handleNavClick(e) {
    e.preventDefault();
    const href = e.target.getAttribute('href');
    if (href && href.startsWith('#')) {
        const sectionId = href.substring(1);
        showSection(sectionId);
        // Update URL without reloading
        history.pushState(null, null, href);
    }
}

// Handle browser back/forward buttons
window.addEventListener('popstate', function(e) {
    const hash = window.location.hash.substring(1);
    if (hash) {
        showSection(hash);
    } else {
        showSection('home');
    }
});



// Initialize the page when the page loads
window.onload = function() {
    // Hamburger menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }

    // Handle navigation links
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', handleNavClick);
    });

    // Handle other links that should navigate within the page
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', handleNavClick);
    });

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });

    // Check initial hash on page load
    const initialHash = window.location.hash.substring(1);
    if (initialHash) {
        showSection(initialHash);
    } else {
        showSection('home');
    }

    initMap();
    // initChatbot(); // Commented out - function not defined
    // initPrediction(); // Commented out - function not defined
};

