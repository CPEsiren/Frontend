
// import useWindowSize from "../hooks/useWindowSize";
// import { Box, Typography } from "@mui/material";

// const ContactUsComponent = () => {
//   const windowSize = useWindowSize();

//   return (
//     <Box
//       sx={{
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//         minHeight: "100vh", // Ensure full viewport height
//         backgroundImage: `url('/ContactUs.png')`,
//         backgroundSize: "cover",
//         backgroundRepeat: "no-repeat",
//         backgroundPosition: "center",
//         padding: 2, // Add padding for spacing
//       }}
//     >
//       {windowSize.width > 600 && (
//         <Typography
//           variant="h4"
//           component="h1"
//           fontWeight={600}
//           color="#242D5D"
//           sx={{ marginTop: 5 }}
//         >
//           CONTACT US
//         </Typography>
//       )}

//       <Box
//         sx={{
//           width: "100%",
//           backgroundColor: "#FFFFFB",
//           borderRadius: 8,
//           marginTop: 2,
//           padding: 3,
//           display: "flex",
//           flexDirection: "column",
//           alignItems: "center",
//           textAlign: "center",
//           boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
//         }}
//       >
//         {windowSize.width < 1100 && (
//           <Typography
//             variant="h5"
//             component="p"
//             sx={{
//               color: "#242D5D",
//               fontWeight: 400,
//               fontSize: 25,
//               marginBottom: 3,
//             }}
//           >
//             Contact us for any queries.
//           </Typography>
//         )}

//         <ContactUsComponent />
//       </Box>
//     </Box>
//   );
// };

// export default ContactUsComponent;
