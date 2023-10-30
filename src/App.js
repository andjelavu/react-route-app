import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  HStack,
  Input,
  SkeletonText,
} from "@chakra-ui/react";

import {
  useJsApiLoader,
  GoogleMap,
  Marker,
  Autocomplete,
  DirectionsRenderer,
} from "@react-google-maps/api";
import { useRef, useState } from "react";

const center = { lat: 42.4426, lng: 19.2685 };

function App() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  const [map, setMap] = useState(null);
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [showStop, setShowStop] = useState(false);
  const originRef = useRef();
  const destinationRef = useRef();
  const stopRef = useRef();
  const [stops, setStops] = useState([]);

  if (!isLoaded) {
    return <SkeletonText />;
  }

  async function calculateRoute() {
    if (originRef.current.value === "" || destinationRef.current.value === "") {
      return;
    }

    const waypoints = stops.map((stop) => ({
      location: stop.location,
      stopover: stop.stopover,
    }));

    // eslint-disable-next-line no-undef
    const directionsService = new google.maps.DirectionsService();
    const results = await directionsService.route({
      origin: originRef.current.value,
      destination: destinationRef.current.value,
      waypoints: waypoints,
      // eslint-disable-next-line no-undef
      travelMode: google.maps.TravelMode.DRIVING,
    });

    setDirectionsResponse(results);
  }

  function showStopInput() {
    setShowStop(!showStop);
  }

  function addStop() {
    const stopLocation = stopRef.current.value;
    if (stopLocation) {
      const newStops = [...stops, { location: stopLocation, stopover: true }];
      setStops(newStops);
      stopRef.current.value = "";
      calculateRoute();
    }
  }

  function clearWaypoints() {
    setStops([]);
    calculateRoute();
  }

  return (
    <Flex
      position="relative"
      flexDirection="column"
      alignItems="center"
      h="100vh"
      w="100vw"
    >
      <Box position="absolute" left={0} top={0} h="100%" w="100%">
        <GoogleMap
          center={center}
          zoom={15}
          mapContainerStyle={{ width: "100%", height: "100%" }}
          options={{
            zoomControl: false,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
          }}
          onLoad={(map) => setMap(map)}
        >
          <Marker position={center} />
          {directionsResponse && (
            <DirectionsRenderer
              directions={directionsResponse}
              waypoints={stops.map((stop) => ({
                location: stop.location,
                stopover: stop.stopover,
              }))}
            />
          )}
        </GoogleMap>
      </Box>
      <Box
        p={4}
        borderRadius="lg"
        m={4}
        bgColor="white"
        shadow="base"
        minW="container.md"
        zIndex="1"
      >
        <HStack
          direction={["column", "row"]}
          spacing={2}
          justifyContent="space-between"
        >
          <Box direction={["column", "row"]} flexGrow={1}>
            <Autocomplete>
              <Input type="text" placeholder="Origin" ref={originRef} />
            </Autocomplete>
          </Box>
          <Box flexGrow={1}>
            <Autocomplete>
              <Input
                type="text"
                placeholder="Destination"
                ref={destinationRef}
              />
            </Autocomplete>
          </Box>
          {showStop && (
            <HStack flexGrow={1}>
              <Box flexGrow={1} padding={1}>
                <Autocomplete>
                  <Input type="text" placeholder="Next stop.." ref={stopRef} />
                </Autocomplete>
              </Box>
              <Button
                colorScheme="gray"
                variant="solid"
                type="submit"
                onClick={addStop}
              >
                Add this waypoint
              </Button>
              <Button
                colorScheme="red"
                variant="link"
                type="submit"
                onClick={clearWaypoints}
              >
                Clear all stops
              </Button>
            </HStack>
          )}

          <ButtonGroup>
            <Button
              colorScheme="red"
              variant="solid"
              type="submit"
              onClick={calculateRoute}
            >
              Show Route
            </Button>
            <Button colorScheme="gray" type="submit" onClick={showStopInput}>
              {!showStop ? "Add stops" : "Hide stops"}
            </Button>
          </ButtonGroup>
        </HStack>
      </Box>
    </Flex>
  );
}

export default App;
