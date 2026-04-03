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
// import React, { useEffect, useState, useRef } from "react";
// import { useParams } from "react-router-dom";
// import { db, realtimeDB } from "../backend/config/firebase";
// import { doc, onSnapshot } from "firebase/firestore";
// import {
//   GoogleMap,
//   Marker,
//   LoadScript,
//   DirectionsRenderer,
// } from "@react-google-maps/api";
// import { onValue, ref } from "firebase/database";

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
//   const [status, setStatus] = useState("starting");
//   const [follow, setFollow] = useState(true);

//   const prevPosRef = useRef(null);
//   const animationRef = useRef(null);
//   const mapRef = useRef(null);
//   const lastRouteTime = useRef(0);

//   // 🔥 HEADING
//   const getHeading = (start, end) => {
//     const dLng = end.lng - start.lng;
//     const dLat = end.lat - start.lat;
//     return (Math.atan2(dLng, dLat) * 180) / Math.PI;
//   };

//   // 🔥 DISTANCE
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

//   // 🚗 LIVE TRACKING (ULTRA SMOOTH)
//   useEffect(() => {
//     const trackingRef = ref(realtimeDB, `tracking/${complaintId}`);

//     const unsub = onValue(trackingRef, (snap) => {
//       if (!snap.exists()) return;

//       const data = snap.val();
//       if (!data?.lat || !data?.lng) return;

//       const newPos = { lat: data.lat, lng: data.lng };

//       if (!prevPosRef.current) {
//         prevPosRef.current = newPos;
//         setEngineerPos(newPos);
//         return;
//       }

//       const start = prevPosRef.current;
//       const end = newPos;

//       setHeading(getHeading(start, end));

//       const distance = getDistance(start, end);
//       // const duration = Math.max(500, Math.min(2000, distance * 10000)); // 🔥 dynamic speed
//       const duration = 800; // 🔥 fixed speed
//       if (distance > 1) {
//         // skip animation (bad GPS jump)
//         prevPosRef.current = end;
//         setEngineerPos(end);
//         return;
//       }

//       let startTime = null;

//       const animate = (time) => {
//         if (!startTime) startTime = time;
//         const progress = Math.min((time - startTime) / duration, 1);

//         const ease = progress * (2 - progress); // 🔥 easing

//         const lat = start.lat + (end.lat - start.lat) * ease;
//         const lng = start.lng + (end.lng - start.lng) * ease;

//         const pos = { lat, lng };

//         setEngineerPos(pos);

//         // 🔥 Smooth camera follow (not every frame)
//         // if (progress > 0.2) {
//         //   mapRef.current?.panTo(pos);
//         // }
//         if (follow && progress === 1) {
//           mapRef.current?.panTo(pos); // only when finished
//         }

//         if (progress < 1) {
//           animationRef.current = requestAnimationFrame(animate);
//         } else {
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

//   // 🏠 CUSTOMER LOCATION
//   // useEffect(() => {
//   //   const unsub = onSnapshot(doc(db, "complaints", complaintId), (snap) => {
//   //     if (!snap.exists()) return;

//   //     const address = snap.data()?.complaintDetails?.address;

//   //     if (!address || !window.google) return;

//   //     const geocoder = new window.google.maps.Geocoder();

//   //     geocoder.geocode({ address }, (res, status) => {
//   //       if (status === "OK") {
//   //         const loc = res[0].geometry.location;

//   //         setCustomerPos({
//   //           lat: loc.lat(),
//   //           lng: loc.lng(),
//   //         });
//   //       }
//   //     });
//   //   });

//   //   return () => unsub();
//   // }, [complaintId]);
//   const customerFetchedRef = useRef(false);

//   useEffect(() => {
//     if (customerFetchedRef.current) return;

//     const unsub = onSnapshot(doc(db, "complaints", complaintId), (snap) => {
//       if (!snap.exists()) return;

//       const address = snap.data()?.complaintDetails?.address;

//       if (!address || !window.google) return;

//       customerFetchedRef.current = true; // ✅ STOP MULTIPLE CALLS

//       const geocoder = new window.google.maps.Geocoder();

//       geocoder.geocode({ address }, (res, status) => {
//         if (status === "OK") {
//           const loc = res[0].geometry.location;

//           setCustomerPos({
//             lat: loc.lat(),
//             lng: loc.lng(),
//           });
//         } else {
//           console.error("Geocode error:", status);
//         }
//       });
//     });

//     return () => unsub();
//   }, [complaintId]);

//   // 🛣 ROUTE + ETA (OPTIMIZED)
//   useEffect(() => {
//     if (!engineerPos || !customerPos || !window.google) return;

//     const now = Date.now();
//     if (now - lastRouteTime.current < 10000) return;

//     lastRouteTime.current = now;

//     const service = new window.google.maps.DirectionsService();

//     service.route(
//       {
//         origin: engineerPos,
//         destination: customerPos,
//         travelMode: window.google.maps.TravelMode.DRIVING,
//       },
//       (res, status) => {
//         if (status === "OK") {
//           setDirections(res);

//           const leg = res.routes[0].legs[0];

//           setEta({
//             distance: leg.distance.text,
//             duration: leg.duration.text,
//           });

//           const dist = getDistance(engineerPos, customerPos);

//           if (dist < 0.1) setStatus("arrived");
//           else if (dist < 1) setStatus("nearby");
//           else setStatus("on_the_way");
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
//         {/* 🚗 CAR */}
//         {engineerPos && (
//           // <Marker
//           //   position={engineerPos}
//           //   icon={{
//           //     url: "https://cdn-icons-png.flaticon.com/512/744/744465.png",
//           //     scaledSize: new window.google.maps.Size(45, 45),
//           //     rotation: heading, // 🔥 THIS MAKES IT REAL
//           //     anchor: new window.google.maps.Point(22, 22),
//           //   }}
//           // />
//           <Marker
//             position={engineerPos}
//             icon={{
//               path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
//               scale: 6,
//               rotation: heading,
//               fillColor: "#2563eb",
//               fillOpacity: 1,
//               strokeWeight: 2,
//             }}
//           />
//         )}

//         {/* 🏠 CUSTOMER */}
//         {customerPos && <Marker position={customerPos} />}

//         {directions && <DirectionsRenderer directions={directions} />}

//         {/* 📦 STATUS */}
//         {eta && (
//           <div style={cardStyle}>
//             <h3>
//               {status === "arrived"
//                 ? "✅ Arrived"
//                 : status === "nearby"
//                   ? "📍 Nearby"
//                   : "🚗 On the way"}
//             </h3>
//             <p>⏱ {eta.duration}</p>
//             <p>📍 {eta.distance}</p>
//           </div>
//         )}
//       </GoogleMap>
//       <button
//         style={{ position: "absolute", top: 20, right: 20 }}
//         onClick={() => setFollow(!follow)}
//       >
//         {follow ? "🧭 Following" : "📍 Follow"}
//       </button>
//     </LoadScript>
//   );
// };

// const cardStyle = {
//   position: "absolute",
//   bottom: 30,
//   left: "50%",
//   transform: "translateX(-50%)",
//   background: "white",
//   padding: "15px",
//   borderRadius: "12px",
//   boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
//   textAlign: "center",
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
  const [speed, setSpeed] = useState(0);
  const [engineerInfo, setEngineerInfo] = useState(null);

  const prevPosRef = useRef(null);
  const animationRef = useRef(null);
  const mapRef = useRef(null);
  const lastRouteTime = useRef(0);

  // 🔥 HEADING
  const getHeading = (start, end) => {
    const dy = end.lat - start.lat;
    const dx = end.lng - start.lng;
    const theta = Math.atan2(dx, dy);
    let angle = (theta * 180) / Math.PI;
    return (angle + 360) % 360;
  };
  // 🔥 DISTANCE (km)
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

  // 🚗 LIVE TRACKING (SMOOTH + SPEED DETECTION)
  useEffect(() => {
    const trackingRef = ref(realtimeDB, `tracking/${complaintId}`);

    const unsub = onValue(trackingRef, (snap) => {
      if (!snap.exists()) return;

      const data = snap.val();
      if (!data?.lat || !data?.lng) return;
      setEngineerInfo({
        name: data.engineerName,
        phone: data.engineerPhone,
      });

      const newPos = { lat: data.lat, lng: data.lng };

      if (!prevPosRef.current) {
        prevPosRef.current = newPos;
        setEngineerPos(newPos);
        return;
      }

      const start = prevPosRef.current;
      const end = newPos;

      const distance = getDistance(start, end);
      const timeDiff = 1;
      const speedKmh = (distance / timeDiff) * 3600;

      setSpeed(speedKmh.toFixed(1));

      // 🔥 SPEED DETECTION
      if (distance < 0.005) {
        setStatus("stopped");
      } else {
        setStatus("moving");
      }

      setHeading(getHeading(start, end));

      // ❌ Ignore big GPS jump
      if (distance > 1) {
        prevPosRef.current = end;
        setEngineerPos(end);
        return;
      }

      const duration = 800;

      let startTime = null;

      const animate = (time) => {
        if (!startTime) startTime = time;
        const progress = Math.min((time - startTime) / duration, 1);

        const ease =
          progress < 0.5
            ? 2 * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        const lat = start.lat + (end.lat - start.lat) * ease;
        const lng = start.lng + (end.lng - start.lng) * ease;

        const pos = { lat, lng };
        setEngineerPos(pos);

        // 🔥 SMOOTH CAMERA FOLLOW
        if (follow && progress > 0.8) {
          mapRef.current?.panTo(pos);
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

  // 🏠 CUSTOMER LOCATION (optimized)
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;

    const unsub = onSnapshot(doc(db, "complaints", complaintId), (snap) => {
      if (!snap.exists()) return;

      const address = snap.data()?.complaintDetails?.address;

      if (!address || !window.google) return;

      fetchedRef.current = true;

      const geocoder = new window.google.maps.Geocoder();

      geocoder.geocode({ address }, (res, status) => {
        if (status === "OK") {
          const loc = res[0].geometry.location;

          setCustomerPos({
            lat: loc.lat(),
            lng: loc.lng(),
          });
        }
      });
    });

    return () => unsub();
  }, [complaintId]);
  useEffect(() => {
    if (!mapRef.current || !engineerPos) return;

    if (follow) {
      mapRef.current.setZoom(17);
      mapRef.current.panTo(engineerPos);
    }
  }, [engineerPos, follow]);
  // 🔥 GOOGLE MAPS AUTO-ZOOM (FITS BOTH MARKERS)
  // useEffect(() => {
  //   if (mapRef.current && engineerPos && customerPos) {
  //     const bounds = new window.google.maps.LatLngBounds();
  //     bounds.extend(
  //       new window.google.maps.LatLng(engineerPos.lat, engineerPos.lng),
  //     );
  //     bounds.extend(
  //       new window.google.maps.LatLng(customerPos.lat, customerPos.lng),
  //     );
  //     mapRef.current.fitBounds(bounds, 100); // 100px padding
  //   }
  // }, [engineerPos, customerPos]);
  const zoomDoneRef = useRef(false);

  useEffect(() => {
    if (mapRef.current && engineerPos && customerPos && !zoomDoneRef.current) {
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend(engineerPos);
      bounds.extend(customerPos);

      mapRef.current.fitBounds(bounds, 100);
      zoomDoneRef.current = true;
    }
  }, [engineerPos, customerPos]);

  // 🛣 ROUTE + ETA
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
        provideRouteAlternatives: true,
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

          if (dist < 0.05) setStatus("arrived");
          else if (dist < 1) setStatus("nearby");
        }
      },
    );
  }, [engineerPos, customerPos]);

  return (
    <LoadScript googleMapsApiKey="AIzaSyAIR5LlBpyyui16nwIiuABaba3u-18g3Z8">
      <GoogleMap
        mapContainerStyle={containerStyle}
        // zoom={15}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
          // styles: darkMapStyle,
        }}
        center={engineerPos || customerPos}
        onLoad={(map) => (mapRef.current = map)}
      >
        {/* 🚗 REAL CAR ICON */}
        {engineerPos && (
          // <Marker
          //   position={engineerPos}
          //   // icon={{
          //   //   url: "https://cdn-icons-png.flaticon.com/512/744/744465.png",
          //   //   scaledSize: new window.google.maps.Size(40, 40),
          //   //   anchor: new window.google.maps.Point(20, 20),
          //   // }}
          //   icon={{
          //     path: "M23.5,17h-1.5V4.5c0-1.38-1.12-2.5-2.5-2.5h-15C3.12,2,2,3.12,2,4.5V17H0.5c-0.28,0-0.5,0.22-0.5,0.5v1 c0,0.28,0.22,0.5,0.5,0.5h23c0.28,0,0.5-0.22,0.5-0.5v-1C24,17.22,23.78,17,23.5,17z M7,12c-0.55,0-1-0.45-1-1s0.45-1,1-1s1,0.45,1,1 S7.55,12,7,12z M17,12c-0.55,0-1-0.45-1-1s0.45-1,1-1s1,0.45,1,1S17.55,12,17,12z",
          //     fillColor: "#1d4ed8",
          //     fillOpacity: 1,
          //     strokeWeight: 1,
          //     scale: 1.5,
          //     rotation: heading, // Rotates the car based on movement
          //     anchor: new window.google.maps.Point(12, 12),
          //   }}
          // />
          <Marker
            position={engineerPos}
            icon={{
              path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
              scale: 6,
              fillColor: "#2563eb",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 2,
              rotation: heading,
            }}
          />
        )}

        {/* 🏠 CUSTOMER */}
        {customerPos && <Marker position={customerPos} />}

        {/* {directions && (
          <DirectionsRenderer
            directions={directions}
            options={{ preserveViewport: true }}
          />
        )} */}
        {directions?.routes?.map((route, i) => (
          <DirectionsRenderer
            key={i}
            directions={{ ...directions, routes: [route] }}
            options={{
              polylineOptions: {
                strokeColor: i === 0 ? "#2563eb" : "#9ca3af",
                strokeWeight: 5,
              },
            }}
          />
        ))}
        {engineerInfo && (
          <div
            style={{
              position: "absolute",
              top: 15,
              left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(255,255,255,0.95)",
              backdropFilter: "blur(8px)",
              padding: "12px 16px",
              borderRadius: "14px",
              boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "#2563eb",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              👨‍🔧
            </div>

            <div>
              <div style={{ fontWeight: "bold" }}>{engineerInfo.name}</div>
              <div style={{ fontSize: "13px", color: "#555" }}>
                {engineerInfo.phone}
              </div>
            </div>

            <a href={`tel:${engineerInfo.phone}`}>
              <button
                style={{
                  background: "#16a34a",
                  color: "white",
                  border: "none",
                  padding: "6px 10px",
                  borderRadius: "8px",
                }}
              >
                Call
              </button>
            </a>
          </div>
        )}
        <button
          onClick={() => {
            setFollow(true);
            mapRef.current?.panTo(engineerPos);
            mapRef.current?.setZoom(17);
          }}
        >
          🚗 Focus
        </button>

        {/* 📦 STATUS CARD */}
        {eta && (
          <div style={cardStyle}>
            <h3 style={{ marginBottom: "5px" }}>
              {status === "arrived"
                ? "✅ Arrived"
                : status === "nearby"
                  ? "📍 Nearby"
                  : status === "moving"
                    ? "🚗 On the way"
                    : "⏸ Stopped"}
            </h3>

            <p style={{ fontSize: "18px", fontWeight: "bold" }}>
              ⏱ {eta.duration}
            </p>

            <p style={{ color: "#555" }}>📍 {eta.distance}</p>

            <div style={{ marginTop: "8px", fontSize: "14px" }}>
              🚀 Speed: <b>{speed} km/h</b>
            </div>
          </div>
        )}
        {customerPos && (
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${customerPos.lat},${customerPos.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              position: "absolute",
              bottom: 145,
              left: "50%",
              transform: "translateX(-50%)",
              background: "#2563eb",
              color: "white",
              padding: "10px 15px",
              borderRadius: "10px",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            🗺 Open in Google Maps
          </a>
        )}
      </GoogleMap>

      {/* <button
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          background: follow ? "#2563eb" : "white",
          color: follow ? "white" : "black",
          borderRadius: "20px",
          padding: "8px 12px",
          border: "none",
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
        }}
        onClick={() => setFollow(!follow)}
      >
        {follow ? "🧭 Following" : "📍 Follow"}
      </button> */}
      <button
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          background: "white",
          borderRadius: "50%",
          width: "45px",
          height: "45px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          border: "none",
          fontSize: "18px",
        }}
        onClick={() => {
          if (mapRef.current && engineerPos) {
            mapRef.current.panTo(engineerPos);
            mapRef.current.setZoom(17); // 🔥 important
          }
        }}
      >
        🎯 Recenter
      </button>
      {/* options={{
  styles: darkMapStyle
}} */}
    </LoadScript>
  );
};

const cardStyle = {
  position: "absolute",
  bottom: 20,
  left: "50%",
  transform: "translateX(-50%)",
  background: "rgba(255,255,255,0.9)",
  backdropFilter: "blur(10px)",
  padding: "18px",
  borderRadius: "16px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  width: "90%",
  maxWidth: "340px",
  textAlign: "left",
};
const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#1f2937" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#9ca3af" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#111827" }] },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#374151" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#0ea5e9" }],
  },
];

export default TrackPage;
