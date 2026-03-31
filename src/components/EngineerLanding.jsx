// // import React from "react";
// // import { useNavigate } from "react-router-dom";
// // import { HardHat, ArrowRight } from "lucide-react";

// // const EngineerLanding = () => {
// //   const navigate = useNavigate();

// //   return (
// //     <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
// //       <div className="bg-white p-10 rounded-[40px] shadow-xl border border-slate-100 text-center max-w-md w-full">
// //         <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
// //           <HardHat size={40} />
// //         </div>

// //         <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight mb-2">
// //           Engineer Portal
// //         </h1>
// //         <p className="text-slate-500 text-sm mb-8 font-medium">
// //           Identity Verified. Access the technical complaint management console below.
// //         </p>

// //         {/* THE BUTTON YOU REQUESTED */}
// //         <button
// //           onClick={() => navigate("/")}
// //           className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg shadow-emerald-100"
// //         >
// //           Enter Engineering Console <ArrowRight size={18} />
// //         </button>
// //       </div>
// //     </div>
// //   );
// // };

// // export default EngineerLanding;
// import React from "react";
// // import { getAuth } from "firebase/auth";

// // import { db } from "../firebase";

// // import { doc, setDoc } from "firebase/firestore";

// import { useState } from "react";
// import { getAuth } from "firebase/auth";
// import { db } from "../backend/config/firebase";
// import { doc, setDoc } from "firebase/firestore";
// import { HardHat, MapPin, PlayCircle } from "lucide-react";

// const EngineerLanding = () => {
//   const [tracking, setTracking] = useState(false);

//   const startTracking = () => {
//     const auth = getAuth();
//     const user = auth.currentUser;

//     const complaintId = "CMP123"; // 🔥 later dynamic

//     if (!navigator.geolocation) {
//       alert("Geolocation not supported");
//       return;
//     }

//     setTracking(true);

//     navigator.geolocation.watchPosition(
//       async (position) => {
//         const { latitude, longitude } = position.coords;

//         console.log("📍 Location:", latitude, longitude);

//         await setDoc(doc(db, "tracking", complaintId), {
//           lat: latitude,
//           lng: longitude,
//           engineerId: user.uid,
//           complaintId: complaintId,
//           status: "on_the_way",
//           updatedAt: new Date(),
//         });
//       },
//       (error) => {
//         console.error("Location error:", error);
//       },
//       {
//         enableHighAccuracy: true,
//         maximumAge: 0,
//         timeout: 5000,
//       },
//     );
//   };

//   return (
//     <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
//       <div className="bg-white w-full max-w-md rounded-[32px] shadow-xl p-8 text-center border border-slate-100">
//         {/* Icon */}
//         <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-emerald-100 flex items-center justify-center text-emerald-600">
//           <HardHat size={40} />
//         </div>

//         {/* Heading */}
//         <h1 className="text-2xl font-black text-slate-800 uppercase mb-2">
//           Engineer Dashboard
//         </h1>

//         <p className="text-sm text-slate-500 mb-6">
//           Start your visit and share live location with the customer
//         </p>

//         {/* Status */}
//         <div className="flex items-center justify-center gap-2 mb-6 text-sm font-semibold">
//           <MapPin size={16} />
//           {tracking ? (
//             <span className="text-green-600">Tracking Live</span>
//           ) : (
//             <span className="text-slate-400">Not Started</span>
//           )}
//         </div>

//         {/* Button */}
//         <button
//           onClick={startTracking}
//           disabled={tracking}
//           className={`w-full py-4 rounded-2xl font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-2 transition-all ${
//             tracking
//               ? "bg-gray-300 text-gray-600 cursor-not-allowed"
//               : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg"
//           }`}
//         >
//           <PlayCircle size={18} />
//           {tracking ? "Tracking Started" : "Start Visit"}
//         </button>
//       </div>
//     </div>
//   );
// };

// export default EngineerLanding;
