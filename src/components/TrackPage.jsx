// // import React, { useEffect, useState, useRef } from "react";
// // import { useParams } from "react-router-dom";
// // import { db } from "../backend/config/firebase";
// // import { doc, onSnapshot } from "firebase/firestore";
// // import {
// //   GoogleMap,
// //   Marker,
// //   LoadScript,
// //   DirectionsRenderer,
// // } from "@react-google-maps/api";

// // const containerStyle = {
// //   width: "100%",
// //   height: "100vh",
// // };

// // const TrackPage = () => {
// //   const { complaintId } = useParams();

// //   const [engineerPos, setEngineerPos] = useState(null);
// //   const [customerPos, setCustomerPos] = useState(null);
// //   const [directions, setDirections] = useState(null);
// //   const [eta, setEta] = useState(null);

// //   const lastRouteTime = useRef(0);

// //   // 🔥 1. ENGINEER LIVE LOCATION (REAL, NO AVERAGING)
// //   // useEffect(() => {
// //   //   const unsub = onSnapshot(doc(db, "tracking", complaintId), (snap) => {
// //   //     if (snap.exists()) {
// //   //       const data = snap.data();

// //   //       if (data?.lat && data?.lng) {
// //   //         setEngineerPos({
// //   //           lat: data.lat,
// //   //           lng: data.lng,
// //   //         });
// //   //       }
// //   //     }
// //   //   });

// //   //   return () => unsub();
// //   // }, [complaintId]);
// //   const animationRef = useRef(null);

// //   useEffect(() => {
// //     const unsub = onSnapshot(doc(db, "tracking", complaintId), (snap) => {
// //       if (snap.exists()) {
// //         const data = snap.data();

// //         if (data?.lat && data?.lng) {
// //           const newPos = {
// //             lat: data.lat,
// //             lng: data.lng,
// //           };

// //           // FIRST TIME (no animation)
// //           if (!engineerPos) {
// //             setEngineerPos(newPos);
// //             return;
// //           }

// //           // 🔥 SMOOTH ANIMATION
// //           const start = { ...engineerPos };
// //           const end = { ...newPos };

// //           let startTime = null;
// //           const duration = 1000; // 1 sec smooth

// //           const animate = (time) => {
// //             if (!startTime) startTime = time;
// //             const progress = (time - startTime) / duration;

// //             if (progress < 1) {
// //               const lat = start.lat + (end.lat - start.lat) * progress;
// //               const lng = start.lng + (end.lng - start.lng) * progress;

// //               setEngineerPos({ lat, lng });

// //               animationRef.current = requestAnimationFrame(animate);
// //             } else {
// //               setEngineerPos(end);
// //             }
// //           };

// //           cancelAnimationFrame(animationRef.current);
// //           animationRef.current = requestAnimationFrame(animate);
// //         }
// //       }
// //     });

// //     return () => {
// //       cancelAnimationFrame(animationRef.current);
// //       unsub();
// //     };
// //   }, [complaintId, engineerPos]);

// //   // 🔥 2. CUSTOMER LOCATION
// //   // useEffect(() => {
// //   //   const unsub = onSnapshot(doc(db, "complaints", complaintId), (snap) => {
// //   //     if (snap.exists()) {
// //   //       const data = snap.data();

// //   //       if (data?.customerLocation) {
// //   //         setCustomerPos(data.customerLocation);
// //   //       }
// //   //     }
// //   //   });

// //   //   return () => unsub();
// //   // }, [complaintId]);
// //   useEffect(() => {
// //     const unsub = onSnapshot(doc(db, "complaints", complaintId), (snap) => {
// //       if (snap.exists()) {
// //         const data = snap.data();

// //         const address = data?.complaintDetails?.address;

// //         if (address && window.google) {
// //           const geocoder = new window.google.maps.Geocoder();

// //           geocoder.geocode({ address }, (results, status) => {
// //             if (status === "OK") {
// //               const loc = results[0].geometry.location;

// //               setCustomerPos({
// //                 lat: loc.lat(),
// //                 lng: loc.lng(),
// //               });
// //             } else {
// //               console.error("Geocode error:", status);
// //             }
// //           });
// //         }
// //       }
// //     });

// //     return () => unsub();
// //   }, [complaintId]);

// //   // 🔥 3. ROUTE + ETA (THROTTLED)
// //   useEffect(() => {
// //     if (!engineerPos || !customerPos || !window.google) return;

// //     const now = Date.now();

// //     // 🚨 Prevent too many API calls (important)
// //     if (now - lastRouteTime.current < 5000) return;

// //     lastRouteTime.current = now;

// //     const service = new window.google.maps.DirectionsService();

// //     service.route(
// //       {
// //         origin: engineerPos,
// //         destination: customerPos,
// //         travelMode: window.google.maps.TravelMode.DRIVING,
// //       },
// //       (result, status) => {
// //         if (status === "OK") {
// //           setDirections(result);

// //           const leg = result.routes[0].legs[0];

// //           setEta({
// //             distance: leg.distance.text,
// //             duration: leg.duration.text,
// //           });
// //         } else {
// //           console.error("Directions error:", status);
// //         }
// //       },
// //     );
// //   }, [engineerPos, customerPos]);

// //   return (
// //     <LoadScript googleMapsApiKey="AIzaSyAIR5LlBpyyui16nwIiuABaba3u-18g3Z8">
// //       <GoogleMap
// //         mapContainerStyle={containerStyle}
// //         zoom={14}
// //         center={engineerPos || customerPos}
// //       >
// //         {/* 🚗 Engineer */}
// //         {engineerPos && (
// //           <Marker
// //             position={engineerPos}
// //             icon={{
// //               url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
// //             }}
// //           />
// //         )}

// //         {/* 🏠 Customer */}
// //         {customerPos && (
// //           <Marker
// //             position={customerPos}
// //             icon={{
// //               url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
// //             }}
// //           />
// //         )}

// //         {/* 🛣 Route */}
// //         {directions && <DirectionsRenderer directions={directions} />}

// //         {/* 📦 STATUS CARD */}
// //         {eta && (
// //           <div
// //             style={{
// //               position: "absolute",
// //               bottom: 30,
// //               left: "50%",
// //               transform: "translateX(-50%)",
// //               background: "white",
// //               padding: "15px 20px",
// //               borderRadius: "15px",
// //               boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
// //               minWidth: "260px",
// //               textAlign: "center",
// //             }}
// //           >
// //             <h3 style={{ margin: 0 }}>🚗 Engineer is on the way</h3>

// //             <p style={{ margin: "5px 0", fontWeight: "bold" }}>
// //               ⏱ {eta.duration}
// //             </p>

// //             <p style={{ margin: 0, color: "#555" }}>📍 {eta.distance} away</p>
// //           </div>
// //         )}
// //       </GoogleMap>
// //     </LoadScript>
// //   );
// // };

// // export default TrackPage;
// // import React, { useEffect, useState, useRef } from "react";
// // import { useParams } from "react-router-dom";
// // import { db } from "../backend/config/firebase";
// // import { doc, onSnapshot } from "firebase/firestore";
// // import {
// //   GoogleMap,
// //   Marker,
// //   LoadScript,
// //   DirectionsRenderer,
// // } from "@react-google-maps/api";

// // const containerStyle = {
// //   width: "100%",
// //   height: "100vh",
// // };

// // const TrackPage = () => {
// //   const { complaintId } = useParams();

// //   const [engineerPos, setEngineerPos] = useState(null);
// //   const [customerPos, setCustomerPos] = useState(null);
// //   const [directions, setDirections] = useState(null);
// //   const [eta, setEta] = useState(null);

// //   const lastRouteTime = useRef(0);
// //   const animationRef = useRef(null);
// //   const prevPosRef = useRef(null);

// //   // ✅ 1. ENGINEER LIVE LOCATION (FIXED)
// //   useEffect(() => {
// //     const unsub = onSnapshot(doc(db, "tracking", complaintId), (snap) => {
// //       if (!snap.exists()) return;

// //       const data = snap.data();
// //       if (!data?.lat || !data?.lng) return;

// //       const newPos = { lat: data.lat, lng: data.lng };

// //       // FIRST LOAD
// //       if (!prevPosRef.current) {
// //         prevPosRef.current = newPos;
// //         setEngineerPos(newPos);
// //         return;
// //       }

// //       // 🔥 SMOOTH ANIMATION (NO RE-RENDER LOOP)
// //       const start = prevPosRef.current;
// //       const end = newPos;

// //       let startTime = null;
// //       const duration = 800;

// //       const animate = (time) => {
// //         if (!startTime) startTime = time;
// //         const progress = (time - startTime) / duration;

// //         if (progress < 1) {
// //           const lat = start.lat + (end.lat - start.lat) * progress;
// //           const lng = start.lng + (end.lng - start.lng) * progress;

// //           setEngineerPos({ lat, lng });
// //           animationRef.current = requestAnimationFrame(animate);
// //         } else {
// //           setEngineerPos(end);
// //           prevPosRef.current = end;
// //         }
// //       };

// //       cancelAnimationFrame(animationRef.current);
// //       animationRef.current = requestAnimationFrame(animate);
// //     });

// //     return () => {
// //       cancelAnimationFrame(animationRef.current);
// //       unsub();
// //     };
// //   }, [complaintId]); // ✅ ONLY complaintId

// //   // ✅ 2. CUSTOMER LOCATION (GEOCODE ONCE)
// //   useEffect(() => {
// //     const unsub = onSnapshot(doc(db, "complaints", complaintId), (snap) => {
// //       if (!snap.exists()) return;

// //       const address = snap.data()?.complaintDetails?.address;

// //       if (!address || !window.google) return;

// //       const geocoder = new window.google.maps.Geocoder();

// //       geocoder.geocode({ address }, (results, status) => {
// //         if (status === "OK") {
// //           const loc = results[0].geometry.location;

// //           setCustomerPos({
// //             lat: loc.lat(),
// //             lng: loc.lng(),
// //           });
// //         }
// //       });
// //     });

// //     return () => unsub();
// //   }, [complaintId]);

// //   // ✅ 3. ROUTE (CONTROLLED - NO SPAM)
// //   useEffect(() => {
// //     if (!engineerPos || !customerPos || !window.google) return;

// //     const now = Date.now();
// //     if (now - lastRouteTime.current < 8000) return; // 🔥 8 sec delay

// //     lastRouteTime.current = now;

// //     const service = new window.google.maps.DirectionsService();

// //     service.route(
// //       {
// //         origin: engineerPos,
// //         destination: customerPos,
// //         travelMode: window.google.maps.TravelMode.DRIVING,
// //       },
// //       (result, status) => {
// //         if (status === "OK") {
// //           setDirections(result);

// //           const leg = result.routes[0].legs[0];
// //           setEta({
// //             distance: leg.distance.text,
// //             duration: leg.duration.text,
// //           });
// //         }
// //       },
// //     );
// //   }, [engineerPos, customerPos]);

// //   return (
// //     <LoadScript googleMapsApiKey="AIzaSyAIR5LlBpyyui16nwIiuABaba3u-18g3Z8">
// //       <GoogleMap
// //         mapContainerStyle={containerStyle}
// //         zoom={14}
// //         center={engineerPos || customerPos}
// //       >
// //         {/* 🚗 ENGINEER (CAR ICON) */}
// //         {engineerPos && (
// //           <Marker
// //             position={engineerPos}
// //             icon={{
// //               url: "https://cdn-icons-png.flaticon.com/512/744/744465.png",
// //               scaledSize: new window.google.maps.Size(40, 40),
// //             }}
// //           />
// //         )}

// //         {/* 🏠 CUSTOMER */}
// //         {customerPos && (
// //           <Marker
// //             position={customerPos}
// //             icon={{
// //               url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
// //             }}
// //           />
// //         )}

// //         {/* 🛣 ROUTE */}
// //         {directions && <DirectionsRenderer directions={directions} />}

// //         {/* 📦 STATUS CARD */}
// //         {eta && (
// //           <div
// //             style={{
// //               position: "absolute",
// //               bottom: 30,
// //               left: "50%",
// //               transform: "translateX(-50%)",
// //               background: "white",
// //               padding: "15px 20px",
// //               borderRadius: "15px",
// //               boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
// //               minWidth: "260px",
// //               textAlign: "center",
// //             }}
// //           >
// //             <h3 style={{ margin: 0 }}>🚗 Engineer is on the way</h3>
// //             <p style={{ margin: "5px 0", fontWeight: "bold" }}>
// //               ⏱ {eta.duration}
// //             </p>
// //             <p style={{ margin: 0, color: "#555" }}>📍 {eta.distance} away</p>
// //           </div>
// //         )}
// //       </GoogleMap>
// //     </LoadScript>
// //   );
// // };

// // export default TrackPage;
// import React, { useEffect, useState, useRef } from "react";
// import { useParams } from "react-router-dom";
// import { db } from "../backend/config/firebase";
// import { doc, onSnapshot } from "firebase/firestore";
// import {
//   GoogleMap,
//   Marker,
//   LoadScript,
//   DirectionsRenderer,
// } from "@react-google-maps/api";

// const containerStyle = {
//   width: "100%",
//   height: "100vh",
// };

// const TrackPage = () => {
//   const { complaintId } = useParams();

//   const [engineerPos, setEngineerPos] = useState(null);
//   const [customerPos, setCustomerPos] = useState(null);
//   const [directions, setDirections] = useState(null);
//   const [eta, setEta] = useState(null);
//   const [heading, setHeading] = useState(0);
//   const [status, setStatus] = useState("on_the_way");

//   const animationRef = useRef(null);
//   const prevPosRef = useRef(null);
//   const lastRouteTime = useRef(0);
//   const mapRef = useRef(null);

//   // 🔥 HEADING CALCULATION
//   const getHeading = (start, end) => {
//     const dLng = end.lng - start.lng;
//     const dLat = end.lat - start.lat;
//     return (Math.atan2(dLng, dLat) * 180) / Math.PI;
//   };

//   // 🔥 DISTANCE CALCULATION (KM)
//   const getDistance = (a, b) => {
//     const R = 6371;
//     const dLat = ((b.lat - a.lat) * Math.PI) / 180;
//     const dLng = ((b.lng - a.lng) * Math.PI) / 180;

//     const val =
//       Math.sin(dLat / 2) ** 2 +
//       Math.cos((a.lat * Math.PI) / 180) *
//         Math.cos((b.lat * Math.PI) / 180) *
//         Math.sin(dLng / 2) ** 2;

//     return R * 2 * Math.atan2(Math.sqrt(val), Math.sqrt(1 - val));
//   };

//   // ✅ ENGINEER LIVE TRACKING (SMOOTH + ROTATION)
//   useEffect(() => {
//     const unsub = onSnapshot(doc(db, "tracking", complaintId), (snap) => {
//       if (!snap.exists()) return;

//       const data = snap.data();
//       if (!data?.lat || !data?.lng) return;

//       const newPos = { lat: data.lat, lng: data.lng };

//       // FIRST LOAD
//       if (!prevPosRef.current) {
//         prevPosRef.current = newPos;
//         setEngineerPos(newPos);
//         return;
//       }

//       const start = prevPosRef.current;
//       const end = newPos;

//       // 🔥 SET ROTATION
//       const angle = getHeading(start, end);
//       setHeading(angle);

//       let startTime = null;
//       const duration = 800;

//       const animate = (time) => {
//         if (!startTime) startTime = time;
//         const progress = (time - startTime) / duration;

//         if (progress < 1) {
//           const lat = start.lat + (end.lat - start.lat) * progress;
//           const lng = start.lng + (end.lng - start.lng) * progress;

//           const newPosition = { lat, lng };

//           setEngineerPos(newPosition);

//           // 🎥 FOLLOW CAMERA
//           mapRef.current?.panTo(newPosition);

//           animationRef.current = requestAnimationFrame(animate);
//         } else {
//           setEngineerPos(end);
//           prevPosRef.current = end;
//         }
//       };

//       cancelAnimationFrame(animationRef.current);
//       animationRef.current = requestAnimationFrame(animate);
//     });

//     return () => {
//       cancelAnimationFrame(animationRef.current);
//       unsub();
//     };
//   }, [complaintId]);

//   // ✅ CUSTOMER LOCATION (GEOCODE)
//   useEffect(() => {
//     const unsub = onSnapshot(doc(db, "complaints", complaintId), (snap) => {
//       if (!snap.exists()) return;

//       const address = snap.data()?.complaintDetails?.address;

//       if (!address || !window.google) return;

//       const geocoder = new window.google.maps.Geocoder();

//       geocoder.geocode({ address }, (results, status) => {
//         if (status === "OK") {
//           const loc = results[0].geometry.location;

//           setCustomerPos({
//             lat: loc.lat(),
//             lng: loc.lng(),
//           });
//         }
//       });
//     });

//     return () => unsub();
//   }, [complaintId]);

//   // ✅ ROUTE + ETA (THROTTLED)
//   useEffect(() => {
//     if (!engineerPos || !customerPos || !window.google) return;

//     const now = Date.now();
//     if (now - lastRouteTime.current < 8000) return;

//     lastRouteTime.current = now;

//     const service = new window.google.maps.DirectionsService();

//     service.route(
//       {
//         origin: engineerPos,
//         destination: customerPos,
//         travelMode: window.google.maps.TravelMode.DRIVING, // 🔥 BIKE MODE
//       },
//       (result, status) => {
//         if (status === "OK") {
//           setDirections(result);

//           const leg = result.routes[0].legs[0];

//           setEta({
//             distance: leg.distance.text,
//             duration: leg.duration.text,
//           });

//           // 🚨 ARRIVAL CHECK
//           const dist = getDistance(engineerPos, customerPos);
//           if (dist < 0.1) {
//             setStatus("arrived");
//           }
//         }
//       },
//     );
//   }, [engineerPos, customerPos]);

//   return (
//     <LoadScript googleMapsApiKey="AIzaSyAIR5LlBpyyui16nwIiuABaba3u-18g3Z8">
//       <GoogleMap
//         mapContainerStyle={containerStyle}
//         zoom={15}
//         center={engineerPos || customerPos}
//         onLoad={(map) => (mapRef.current = map)}
//       >
//         {/* 🚗 ENGINEER CAR */}
//         {engineerPos && (
//           <Marker
//             position={engineerPos}
//             icon={{
//               url: "https://cdn-icons-png.flaticon.com/512/744/744465.png",
//               scaledSize: new window.google.maps.Size(45, 45),
//               anchor: new window.google.maps.Point(22, 22),
//               rotation: heading,
//             }}
//           />
//         )}

//         {/* 🏠 CUSTOMER */}
//         {customerPos && (
//           <Marker
//             position={customerPos}
//             icon={{
//               url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
//             }}
//           />
//         )}

//         {/* 🛣 ROUTE */}
//         {directions && <DirectionsRenderer directions={directions} />}

//         {/* 📦 STATUS UI */}
//         {eta && (
//           <div
//             style={{
//               position: "absolute",
//               bottom: 30,
//               left: "50%",
//               transform: "translateX(-50%)",
//               background: "white",
//               padding: "15px 20px",
//               borderRadius: "15px",
//               boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
//               minWidth: "260px",
//               textAlign: "center",
//             }}
//           >
//             <h3 style={{ margin: 0 }}>
//               {status === "arrived"
//                 ? "✅ Engineer has arrived"
//                 : "🚗 Engineer is on the way"}
//             </h3>

//             <p style={{ margin: "5px 0", fontWeight: "bold" }}>
//               ⏱ {eta.duration}
//             </p>

//             <p style={{ margin: 0, color: "#555" }}>📍 {eta.distance} away</p>
//           </div>
//         )}
//       </GoogleMap>
//     </LoadScript>
//   );
// };

// export default TrackPage;
import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { db, realtimeDB } from "../backend/config/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import {
  GoogleMap,
  Marker,
  LoadScript,
  DirectionsRenderer,
} from "@react-google-maps/api";
import { onValue, ref } from "firebase/database";

const containerStyle = {
  width: "100%",
  height: "100vh",
};

const TrackPage = () => {
  const { complaintId } = useParams();

  const [engineerPos, setEngineerPos] = useState(null);
  const [customerPos, setCustomerPos] = useState(null);
  const [directions, setDirections] = useState(null);
  const [eta, setEta] = useState(null);
  const [heading, setHeading] = useState(0);
  const [status, setStatus] = useState("starting");
  const [follow, setFollow] = useState(true);

  const prevPosRef = useRef(null);
  const animationRef = useRef(null);
  const mapRef = useRef(null);
  const lastRouteTime = useRef(0);

  // 🔥 HEADING
  const getHeading = (start, end) => {
    const dLng = end.lng - start.lng;
    const dLat = end.lat - start.lat;
    return (Math.atan2(dLng, dLat) * 180) / Math.PI;
  };

  // 🔥 DISTANCE
  const getDistance = (a, b) => {
    const R = 6371;
    const dLat = ((b.lat - a.lat) * Math.PI) / 180;
    const dLng = ((b.lng - a.lng) * Math.PI) / 180;

    const val =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((a.lat * Math.PI) / 180) *
        Math.cos((b.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;

    return R * 2 * Math.atan2(Math.sqrt(val), Math.sqrt(1 - val));
  };

  // 🚗 LIVE TRACKING (ULTRA SMOOTH)
  useEffect(() => {
    const trackingRef = ref(realtimeDB, `tracking/${complaintId}`);

    const unsub = onValue(trackingRef, (snap) => {
      if (!snap.exists()) return;

      const data = snap.val();
      if (!data?.lat || !data?.lng) return;

      const newPos = { lat: data.lat, lng: data.lng };

      if (!prevPosRef.current) {
        prevPosRef.current = newPos;
        setEngineerPos(newPos);
        return;
      }

      const start = prevPosRef.current;
      const end = newPos;

      setHeading(getHeading(start, end));

      const distance = getDistance(start, end);
      // const duration = Math.max(500, Math.min(2000, distance * 10000)); // 🔥 dynamic speed
      const duration = 800; // 🔥 fixed speed
      if (distance > 1) {
        // skip animation (bad GPS jump)
        prevPosRef.current = end;
        setEngineerPos(end);
        return;
      }

      let startTime = null;

      const animate = (time) => {
        if (!startTime) startTime = time;
        const progress = Math.min((time - startTime) / duration, 1);

        const ease = progress * (2 - progress); // 🔥 easing

        const lat = start.lat + (end.lat - start.lat) * ease;
        const lng = start.lng + (end.lng - start.lng) * ease;

        const pos = { lat, lng };

        setEngineerPos(pos);

        // 🔥 Smooth camera follow (not every frame)
        // if (progress > 0.2) {
        //   mapRef.current?.panTo(pos);
        // }
        if (follow && progress === 1) {
          mapRef.current?.panTo(pos); // only when finished
        }

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          prevPosRef.current = end;
        }
      };

      cancelAnimationFrame(animationRef.current);
      animationRef.current = requestAnimationFrame(animate);
    });

    return () => {
      cancelAnimationFrame(animationRef.current);
      unsub();
    };
  }, [complaintId]);

  // 🏠 CUSTOMER LOCATION
  // useEffect(() => {
  //   const unsub = onSnapshot(doc(db, "complaints", complaintId), (snap) => {
  //     if (!snap.exists()) return;

  //     const address = snap.data()?.complaintDetails?.address;

  //     if (!address || !window.google) return;

  //     const geocoder = new window.google.maps.Geocoder();

  //     geocoder.geocode({ address }, (res, status) => {
  //       if (status === "OK") {
  //         const loc = res[0].geometry.location;

  //         setCustomerPos({
  //           lat: loc.lat(),
  //           lng: loc.lng(),
  //         });
  //       }
  //     });
  //   });

  //   return () => unsub();
  // }, [complaintId]);
  const customerFetchedRef = useRef(false);

  useEffect(() => {
    if (customerFetchedRef.current) return;

    const unsub = onSnapshot(doc(db, "complaints", complaintId), (snap) => {
      if (!snap.exists()) return;

      const address = snap.data()?.complaintDetails?.address;

      if (!address || !window.google) return;

      customerFetchedRef.current = true; // ✅ STOP MULTIPLE CALLS

      const geocoder = new window.google.maps.Geocoder();

      geocoder.geocode({ address }, (res, status) => {
        if (status === "OK") {
          const loc = res[0].geometry.location;

          setCustomerPos({
            lat: loc.lat(),
            lng: loc.lng(),
          });
        } else {
          console.error("Geocode error:", status);
        }
      });
    });

    return () => unsub();
  }, [complaintId]);

  // 🛣 ROUTE + ETA (OPTIMIZED)
  useEffect(() => {
    if (!engineerPos || !customerPos || !window.google) return;

    const now = Date.now();
    if (now - lastRouteTime.current < 10000) return;

    lastRouteTime.current = now;

    const service = new window.google.maps.DirectionsService();

    service.route(
      {
        origin: engineerPos,
        destination: customerPos,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (res, status) => {
        if (status === "OK") {
          setDirections(res);

          const leg = res.routes[0].legs[0];

          setEta({
            distance: leg.distance.text,
            duration: leg.duration.text,
          });

          const dist = getDistance(engineerPos, customerPos);

          if (dist < 0.1) setStatus("arrived");
          else if (dist < 1) setStatus("nearby");
          else setStatus("on_the_way");
        }
      },
    );
  }, [engineerPos, customerPos]);

  return (
    <LoadScript googleMapsApiKey="AIzaSyAIR5LlBpyyui16nwIiuABaba3u-18g3Z8">
      <GoogleMap
        mapContainerStyle={containerStyle}
        zoom={15}
        center={engineerPos || customerPos}
        onLoad={(map) => (mapRef.current = map)}
      >
        {/* 🚗 CAR */}
        {engineerPos && (
          // <Marker
          //   position={engineerPos}
          //   icon={{
          //     url: "https://cdn-icons-png.flaticon.com/512/744/744465.png",
          //     scaledSize: new window.google.maps.Size(45, 45),
          //     rotation: heading, // 🔥 THIS MAKES IT REAL
          //     anchor: new window.google.maps.Point(22, 22),
          //   }}
          // />
          <Marker
            position={engineerPos}
            icon={{
              path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
              scale: 6,
              rotation: heading,
              fillColor: "#2563eb",
              fillOpacity: 1,
              strokeWeight: 2,
            }}
          />
        )}

        {/* 🏠 CUSTOMER */}
        {customerPos && <Marker position={customerPos} />}

        {directions && <DirectionsRenderer directions={directions} />}

        {/* 📦 STATUS */}
        {eta && (
          <div style={cardStyle}>
            <h3>
              {status === "arrived"
                ? "✅ Arrived"
                : status === "nearby"
                  ? "📍 Nearby"
                  : "🚗 On the way"}
            </h3>
            <p>⏱ {eta.duration}</p>
            <p>📍 {eta.distance}</p>
          </div>
        )}
      </GoogleMap>
      <button
        style={{ position: "absolute", top: 20, right: 20 }}
        onClick={() => setFollow(!follow)}
      >
        {follow ? "🧭 Following" : "📍 Follow"}
      </button>
    </LoadScript>
  );
};

const cardStyle = {
  position: "absolute",
  bottom: 30,
  left: "50%",
  transform: "translateX(-50%)",
  background: "white",
  padding: "15px",
  borderRadius: "12px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
  textAlign: "center",
};

export default TrackPage;
