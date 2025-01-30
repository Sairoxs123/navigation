import React, { useState, useEffect, useRef } from 'react';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { StyleSheet, View, Text, Alert } from 'react-native';
import Slider from '@react-native-community/slider';
import * as Location from 'expo-location';

const App = () => {
  const mapRef = useRef(null);
  const [errmsg, setErrorMsg] = useState(null);
  const [camera, setCamera] = useState({
    center: {
      latitude: 25.191582807810565,
      longitude: 55.252884440124035,
    },
    pitch: 0,
    heading: -55,
    zoom: 18.25,
  });
  const [firstLocation, setFirstLocation] = useState(null);
  const [secondLocation, setSecondLocation] = useState(null);
  const [coordinates, setCoordinates] = useState([]);
  const [location, setLocation] = useState(null);
  const [distance, setDistance] = useState(null);

  function dijkstra(graph, source, target) {
    // Initialize distances and previous nodes for all nodes
    const distance = {};
    const previous = {};
    for (const node in graph) {
      distance[node] = Infinity;
      previous[node] = null;
    }
    distance[source] = 0;

    // Use a set to keep track of unvisited nodes
    const unvisited = new Set(Object.keys(graph));

    // Main loop: explore nodes with the shortest tentative distances
    while (unvisited.size > 0) {
      // Find the unvisited node with the shortest tentative distance
      let current = null;
      let minDistance = Infinity;
      for (const node of unvisited) {
        if (distance[node] < minDistance) {
          current = node;
          minDistance = distance[node];
        }
      }
      unvisited.delete(current);

      // Break if target is reached
      if (current === target) {
        break;
      }

      // Relax edges (update distances) for neighboring nodes
      for (const neighbor in graph[current]) {
        const newDistance = distance[current] + graph[current][neighbor];
        if (newDistance < distance[neighbor]) {
          distance[neighbor] = newDistance;
          previous[neighbor] = current;
        }
      }
    }

    // Reconstruct path if it exists
    const path = [];
    if (distance[target] !== Infinity) {
      let temp = target;
      while (temp) {
        path.push(temp);
        temp = previous[temp];
      }
      path.reverse();  // Reverse to get path from source to target
    }

    return { distance: distance[target], path };
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

  const graph = {
    "Admin Department": {
      "KG Play area": 50.529032297952135,
      "Basketball Court A": 26.203050151953796,
      "Football Field": 106.02017012389383,
    },
    "KG Play area": {
      "Admin Department": 50.529032297952135,
      "Tennis Court": 74.95151523947659,
    },
    "Basketball Court A": {
      "Admin Department": 26.203050151953796,
      "Auditorium": 28.48585204588383
    },
    "Football Field": {
      "Admin Department": 106.02017012389383,
      "Basketball Court B": 38.48489221475062,
      "Swimming Pool": 45.16772602358839,
    },
    "Basketball Court B": {
      "Football Field": 38.48489221475062,
      "Library": 30.160316360671107,
      "Swimming Pool": 16.523553609564864,
    },
    "Canteen": {
      "Book Store": 50.95116073683099,
      "Library": 54.682941601110215,
      "Tennis Court": 21.523084398669692,
      "Auditorium": 36.97256944708198
    },
    "Book Store": {
      "Canteen": 50.95116073683099,
      "Library": 25.428145968573155,
      "Tennis Court": 71.13648183727625,
      "Auditorium": 41.15120118764267
    },
    "Library": {
      "Basketball Court B": 30.160316360671107,
      "Canteen": 54.682941601110215,
      "Book Store": 25.428145968573155,
      "Tennis Court": 70.08178518071178,
      "Swimming Pool": 28.301801163107402,
      "Auditorium": 26.537535307816402
    },
    "Tennis Court": {
      "KG Play area": 74.95151523947659,
      "Canteen": 21.523084398669692,
      "Book Store": 71.13648183727625,
      "Library": 70.08178518071178,
      "Auditorium": 46.744181258578436
    },
    "Swimming Pool": {
      "Football Field": 45.16772602358839,
      "Basketball Court B": 16.523553609564864,
      "Library": 28.301801163107402,
    },
    "Auditorium": {
      "Basketball Court A": 28.48585204588383,
      "Canteen": 36.97256944708198,
      "Book Store": 41.15120118764267,
      "Library": 26.537535307816402,
      "Tennis Court": 46.744181258578436,
    }
  }

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      setLocation({ latitude, longitude });
    })();
  }, []);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.animateCamera(camera, { duration: 200 });
    }
  }, [camera]);

  useEffect(() => {
    if (location && coordinates.length > 0) {
      const updatedCoordinates = updatePolylineCoordinates(location, coordinates);
      setCoordinates(updatedCoordinates);
    }
  }, [location]);

  const handlePitchChange = (value) => {
    setCamera({ ...camera, pitch: value });
  };

  const handleLocationPress = (name) => {
    if (!firstLocation) {
      setFirstLocation(name);
      Alert.alert('First location selected. Please select the second location.');
    } else if (!secondLocation) {
      setSecondLocation(name);
      Alert.alert('Second location selected.');
      const { distance, path } = dijkstra(graph, firstLocation, name);
      setCoordinates(path.map((name) => locations[name]));
      setDistance(Math.round(distance));
    } else {
      setFirstLocation(null);
      setSecondLocation(null);
    }
  };

  const updatePolylineCoordinates = (userLocation, polylineCoordinates) => {
    // Find the closest point on the polyline to the user's current location
    let closestIndex = 0;
    let minDistance = Infinity;
    polylineCoordinates.forEach((coordinate, index) => {
      const distance = getDistance(userLocation, coordinate);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });

    // Return the updated polyline coordinates starting from the closest point
    return polylineCoordinates.slice(closestIndex);
  };

  const getDistance = (coord1, coord2) => {
    const toRadians = (degrees) => degrees * (Math.PI / 180);
    const earthRadiusMeters = 6371000;

    const deltaLat = toRadians(coord2.latitude - coord1.latitude);
    const deltaLng = toRadians(coord2.longitude - coord1.longitude);

    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(toRadians(coord1.latitude)) * Math.cos(toRadians(coord2.latitude)) *
      Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return earthRadiusMeters * c;
  };

  return (
    errmsg
      ? <Text>Error: {errmsg}</Text>
      : <View style={{ flex: 1 }}>
        <MapView
          provider="google"
          userInterfaceStyle="dark"
          showsUserLocation={true}
          style={styles.map}
          ref={mapRef}
          camera={camera}
          initialCamera={camera}
          rotateEnabled={true}
          pitchEnabled={true}
          mapType="satellite"
        >
          {Object.entries(locations).map(([name, coordinate]) => (
            <Marker
              key={name}
              coordinate={coordinate}
              title={name}
              pinColor='blue'
              onPress={() => handleLocationPress(name)}
            />
          ))}
          {secondLocation && <Polyline coordinates={coordinates} strokeWidth={5} lineDashPattern={[5, 5]} strokeColor='orange' />}
        </MapView>
        <Slider
          style={{
            position: 'absolute',
            bottom: 400,
            right: -130,
            height: 10,
            width: 300,
            transform: [{ rotate: '-90deg' }],
          }}
          minimumValue={0}
          maximumValue={90}
          value={camera.pitch}
          onValueChange={handlePitchChange}
          minimumTrackTintColor="#007AFF"
          maximumTrackTintColor="#AAAAAA"
          thumbTintColor="#FFFFFF"
        />
        {secondLocation && (
          <View style={styles.distanceContainer}>
            <Text>Distance: {distance}m</Text>
          </View>
        )}
      </View>
  );
};

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  distanceContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
  },
});

export default App;