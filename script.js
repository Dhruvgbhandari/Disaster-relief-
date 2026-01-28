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
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);

    // Add markers for sample resources
    addResourceMarkers();

    // Set up search functionality
    setupSearch();
}

function addResourceMarkers() {
    resources.forEach(resource => {
        const marker = L.marker([resource.lat, resource.lng]).addTo(map);
        marker.bindPopup(`<div><strong>${resource.name}</strong><br>Type: ${resource.type}<br>Address: ${resource.address}</div>`);

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

    // For open source alternative, we'll show sample resources
    // In a real implementation, you could integrate with OpenStreetMap Nominatim API or other services
    setTimeout(() => {
        hideSpinner();
        alert('Search functionality now uses sample disaster relief resources. For a full implementation, consider integrating with OpenStreetMap Nominatim API or other open geocoding services.');
        addResourceMarkers();
    }, 1000);
}

function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            hideSpinner();
            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;

            map.setView([userLat, userLng], 14);

            // Find nearby resources within 10km
            const nearbyResources = resources.filter(resource => {
                const distance = map.distance([userLat, userLng], [resource.lat, resource.lng]);
                return distance <= 10000; // 10km in meters
            });

            clearMarkers();
            nearbyResources.forEach(resource => {
                const marker = L.marker([resource.lat, resource.lng]).addTo(map);
                marker.bindPopup(`<div><strong>${resource.name}</strong><br>Type: ${resource.type}<br>Address: ${resource.address}</div>`);
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

// Initialize the map when the page loads
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

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });

    initMap();
};
