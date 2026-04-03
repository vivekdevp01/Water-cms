// import React, { useEffect, useState } from "react";
// import { getAuth } from "firebase/auth";
// import { db } from "../backend/config/firebase";
// import {
//   collection,
//   query,
//   where,
//   getDocs,
//   setDoc,
//   doc,
// } from "firebase/firestore";

// const EngineerDashboard = () => {
//   const [complaints, setComplaints] = useState([]);
//   const [activeTrackingId, setActiveTrackingId] = useState(null);
//   const startTracking = (complaintId) => {
//     const user = getAuth().currentUser;

//     setActiveTrackingId(complaintId);

//     navigator.geolocation.watchPosition(async (pos) => {
//       const { latitude, longitude } = pos.coords;

//       await setDoc(doc(db, "tracking", complaintId), {
//         lat: latitude,
//         lng: longitude,
//         engineerId: user.uid,
//         complaintId,
//         status: "on_the_way",
//         updatedAt: new Date(),
//       });
//     });
//   };

//   useEffect(() => {
//     const fetchComplaints = async () => {
//       const user = getAuth().currentUser;

//       if (!user) return;

//       const q = query(
//         collection(db, "complaints"),
//         where("step2_assignment.engineerId", "==", user.uid),
//       );

//       const snapshot = await getDocs(q);

//       const data = snapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       }));

//       setComplaints(data);

//       console.log("Assigned Complaints:", data);
//     };

//     fetchComplaints();
//   }, []);

//   return (
//     <div className="p-6">
//       <h1 className="text-xl font-bold mb-4">Assigned Complaints</h1>

//       {complaints.length === 0 ? (
//         <p>No complaints assigned</p>
//       ) : (
//         complaints.map((c) => (
//           <div key={c.id} className="border rounded-lg p-4 mb-3 shadow-sm">
//             <h2 className="font-bold">
//               {c.complaintDetails?.natureOfComplaint}
//             </h2>

//             <p>👤 {c.complaintDetails?.complaintReceivedFrom}</p>
//             <p>📍 {c.complaintDetails?.address}</p>

//             <button
//               onClick={() => startTracking(c.id)}
//               disabled={activeTrackingId === c.id}
//               className={`mt-3 px-4 py-2 rounded ${
//                 activeTrackingId === c.id
//                   ? "bg-gray-400"
//                   : "bg-green-600 text-white"
//               }`}
//             >
//               {activeTrackingId === c.id ? "Tracking..." : "Start Visit"}
//             </button>
//           </div>
//         ))
//       )}
//     </div>
//   );
// };

// export default EngineerDashboard;
import React, { useEffect, useRef, useState } from "react";
import { getAuth } from "firebase/auth";
import { db, realtimeDB } from "../backend/config/firebase";
import { ref, set, update } from "firebase/database";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
} from "firebase/firestore";
import { MapPin, Play, Square } from "lucide-react";

const EngineerDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [activeTrackingId, setActiveTrackingId] = useState(null);
  const [watchId, setWatchId] = useState(null);

  // 🔥 START TRACKING
  // const startTracking = (complaintId) => {
  //   const user = getAuth().currentUser;

  //   if (!navigator.geolocation) {
  //     alert("Geolocation not supported");
  //     return;
  //   }

  //   setActiveTrackingId(complaintId);

  //   // const id = navigator.geolocation.watchPosition(
  //   //   async (pos) => {
  //   //     const { latitude, longitude } = pos.coords;
  //   //     const dbRT = getDatabase();

  //   //     await set(ref(dbRT, "tracking/" + complaintId), {
  //   //       lat: latitude,
  //   //       lng: longitude,
  //   //       engineerId: user.uid,
  //   //       complaintId,
  //   //       status: "on_the_way",
  //   //       updatedAt: Date.now(),
  //   //     });

  //   //     // await setDoc(doc(db, "tracking", complaintId), {
  //   //     //   lat: latitude,
  //   //     //   lng: longitude,
  //   //     //   engineerId: user.uid,
  //   //     //   complaintId,
  //   //     //   status: "on_the_way",
  //   //     //   updatedAt: new Date(),
  //   //     // });
  //   //   },
  //   //   (err) => console.error(err),
  //   //   { enableHighAccuracy: true },
  //   // );
  //   const id = navigator.geolocation.watchPosition(
  //     async (pos) => {
  //       const { latitude, longitude } = pos.coords;

  //       const now = Date.now();

  //       // 🔥 THROTTLE (every 3 sec)
  //       if (!window.lastUpdate || now - window.lastUpdate > 3000) {
  //         window.lastUpdate = now;

  //         const dbRT = getDatabase();

  //         await set(ref(dbRT, "tracking/" + complaintId), {
  //           lat: latitude,
  //           lng: longitude,
  //           engineerId: user.uid,
  //           complaintId,
  //           status: "on_the_way",
  //           updatedAt: now,
  //         });
  //       }
  //     },
  //     (err) => console.error(err),
  //     {
  //       enableHighAccuracy: true,
  //       maximumAge: 3000,
  //     },
  //   );
  //   setWatchId(id);
  // };
  const lastUpdateRef = useRef(0);

  // const startTracking = (complaintId) => {
  //   if (watchId !== null) return;

  //   const user = getAuth().currentUser;

  //   const id = navigator.geolocation.watchPosition(
  //     async (pos) => {
  //       const { latitude, longitude } = pos.coords;
  //       const now = Date.now();

  //       if (now - lastUpdateRef.current > 3000) {
  //         lastUpdateRef.current = now;

  //         await set(ref(realtimeDB, "tracking/" + complaintId), {
  //           lat: latitude,
  //           lng: longitude,
  //           engineerId: user.uid,
  //           complaintId,
  //           status: "on_the_way",
  //           updatedAt: now,
  //         });
  //       }
  //     },
  //     (err) => console.error(err),
  //     {
  //       enableHighAccuracy: true,
  //       maximumAge: 3000,
  //     },
  //   );

  //   setWatchId(id);
  //   setActiveTrackingId(complaintId);
  // };
  // 🔴 STOP TRACKING
  // const stopTracking = async () => {
  //   if (watchId !== null) {
  //     navigator.geolocation.clearWatch(watchId);
  //   }

  //   if (activeTrackingId) {
  //     // await setDoc(
  //     //   doc(db, "tracking", activeTrackingId),
  //     //   {
  //     //     status: "stopped",
  //     //     updatedAt: new Date(),
  //     //   },
  //     //   { merge: true },
  //     // );
  //     const dbRT = getDatabase();

  //     await set(ref(dbRT, "tracking/" + activeTrackingId), {
  //       status: "stopped",
  //       updatedAt: Date.now(),
  //     });
  //   }

  //   setActiveTrackingId(null);
  //   setWatchId(null);
  // };
  const startTracking = async (complaintId) => {
    if (watchId !== null) return;

    const user = getAuth().currentUser;
    if (!user) return;
    const engineerDoc = await getDoc(doc(db, "users", user.uid));
    const engineerData = engineerDoc.data();
    console.log("Engineer Data:", engineerData);

    console.log("Start tracking:", complaintId);

    const id = navigator.geolocation.watchPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;

          console.log("Sending:", latitude, longitude);

          const now = Date.now();

          if (now - lastUpdateRef.current > 3000) {
            lastUpdateRef.current = now;

            await set(ref(realtimeDB, `tracking/${complaintId}`), {
              lat: latitude,
              lng: longitude,
              engineerId: user.uid,
              engineerName: engineerData?.name || "Unknown Engineer",
              engineerPhone: engineerData?.phone || "N/A",
              complaintId,
              status: "on_the_way",
              updatedAt: now,
            });
            console.log("Location updated in Realtime DB");
          }
        } catch (err) {
          console.error("Realtime DB error:", err);
        }
      },
      (err) => {
        console.error("Geo error:", err);
        alert("Location access denied or unavailable");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 3000,
        timeout: 10000,
      },
    );

    setWatchId(id);
    setActiveTrackingId(complaintId);
  };
  // const stopTracking = async () => {
  //   if (watchId !== null) {
  //     navigator.geolocation.clearWatch(watchId);
  //   }

  //   if (activeTrackingId) {
  //     await update(ref(realtimeDB, "tracking/" + activeTrackingId), {
  //       status: "stopped",
  //       updatedAt: Date.now(),
  //     });
  //   }

  //   setWatchId(null);
  //   setActiveTrackingId(null);
  // };
  // const stopTracking = async () => {
  //   try {
  //     if (watchId !== null) {
  //       navigator.geolocation.clearWatch(watchId);
  //     }

  //     if (activeTrackingId) {
  //       await update(ref(realtimeDB, `tracking/${activeTrackingId}`), {
  //         status: "stopped",
  //         updatedAt: Date.now(),
  //       });
  //     }

  //     console.log("Tracking stopped");

  //     setWatchId(null);
  //     setActiveTrackingId(null);
  //   } catch (err) {
  //     console.error("Stop error:", err);
  //   }
  // };
  const stopTracking = async () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }

    if (activeTrackingId) {
      // Clean up the tracking data or set status to offline
      await update(ref(realtimeDB, `tracking/${activeTrackingId}`), {
        status: "offline",
        updatedAt: Date.now(),
      });
      setActiveTrackingId(null);
    }
  };

  useEffect(() => {
    const fetchComplaints = async () => {
      const user = getAuth().currentUser;
      if (!user) return;

      const q = query(
        collection(db, "complaints"),
        where("step2_assignment.engineerId", "==", user.uid),
      );

      const snapshot = await getDocs(q);

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setComplaints(data);
    };

    fetchComplaints();
  }, []);
  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <h1 className="text-2xl font-black text-slate-800 mb-6">
        👨‍🔧 Assigned Complaints
      </h1>

      {complaints.length === 0 ? (
        <p className="text-gray-500">No complaints assigned</p>
      ) : (
        <div className="grid gap-4">
          {complaints.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-2xl shadow-md p-5 border"
            >
              <h2 className="text-lg font-bold text-slate-800">
                {c.complaintDetails?.natureOfComplaint}
              </h2>

              <p className="text-sm text-gray-600">
                👤 {c.complaintDetails?.complaintReceivedFrom}
              </p>

              <p className="text-sm text-gray-600 flex items-center gap-1">
                <MapPin size={14} />
                {c.complaintDetails?.address}
              </p>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => startTracking(c.id)}
                  disabled={activeTrackingId === c.id}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 ${
                    activeTrackingId === c.id
                      ? "bg-gray-300"
                      : "bg-emerald-600 text-white hover:bg-emerald-700"
                  }`}
                >
                  <Play size={16} />
                  {activeTrackingId === c.id ? "Tracking..." : "Start Visit"}
                </button>

                {activeTrackingId === c.id && (
                  <button
                    onClick={stopTracking}
                    className="flex-1 py-2 rounded-xl text-sm font-semibold bg-red-500 text-white hover:bg-red-600 flex items-center justify-center gap-2"
                  >
                    <Square size={16} />
                    Stop
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EngineerDashboard;
