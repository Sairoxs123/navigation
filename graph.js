function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
}

const locations = {
    "Admin Department": { latitude: 25.191468733915016, longitude: 55.253087282180786 },
    "KG Play area": { latitude: 25.19106006937515, longitude: 55.25286767631769 },
    "Basketball Court A": { latitude: 25.191590999282994, longitude: 55.25286465883255 },
    "Football Field": { latitude: 25.19242106563295, longitude: 55.253138579428196 },
    "Basketball Court B": { latitude: 25.192144074091672, longitude: 55.25290925055742 },
    "Canteen": { latitude: 25.19165167683939, longitude: 55.2522661909461 },
    "Book Store": { latitude: 25.192070047768066, longitude: 55.25247272104025 },
    "Library": { latitude: 25.19195688448967, longitude: 55.25269232690334 },
    "Tennis Court": { latitude: 25.191458115328896, longitude: 55.25226652622223 },
    "Swimming Pool": { latitude: 25.192204144599895, longitude: 55.25275904685259 },
    "Auditorium": { latitude: 25.191726310192312, longitude: 55.25262426584959 },
};

const graph = {};

for (const startPoint in locations) {
    graph[startPoint] = {};
    for (const endPoint in locations) {
        if (startPoint !== endPoint) {
            const distance = haversine(
                locations[startPoint].latitude,
                locations[startPoint].longitude,
                locations[endPoint].latitude,
                locations[endPoint].longitude
            );
            graph[startPoint][endPoint] = distance;
        }
    }
}

console.log(JSON.stringify(graph, null, 2));