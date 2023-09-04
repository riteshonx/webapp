// @ts-ignore

// import { Equipment } from "./FullMapViewContainer";

// export function SearchFormDeprecated({
//   equipments,
// }: {
//   equipments: Equipment[];
// }) {
//   return (
//     <form
//       style={{
//         position: "relative",
//         top: "-100%",
//         float: "right",
//       }}
//       onSubmit={(e) => {
//         e.preventDefault();
//         console.log("submit");
//         const searchResult = equipments.find((item, idx) => {
//           if (
//             String(item.EquipmentHeader.EquipmentId).toLowerCase() ===
//             String(searchKeywords).toLowerCase()
//           ) {
//             setCurrentItemId((prevItemId) => {
//               handleCurrentEquipmentMarkerChange(idx, prevItemId);
//               return idx;
//             });
//             return true;
//           }
//         });
//         console.log("searchResult", equipments, searchResult);
//         if (searchResult) {
//           map.setCenter({
//             lat: searchResult.Location.Latitude,
//             lng: searchResult.Location.Longitude,
//           });
//         } else {
//           setSearchNotFoundDialogOpen(true);
//         }
//       }}
//     >
//       <SearchInput
//         classes={{
//           notchedOutline: "noBorder",
//         }}
//         inputProps={{
//           style: {
//             borderColor: "fff",
//           },
//         }}
//         onChange={handleKeywordsChange}
//         value={searchKeywords}
//         inputRef={searchInputRef}
//         style={{
//           position: "relative",
//           marginRight: "auto",
//           float: "right",
//           right: 66,
//           top: 12,
//           backgroundColor: "white",
//           padding: "2px",
//           borderRadius: 2,
//           // border: "1px solid fff",
//           boxShadow: "rgb(0 0 0 / 30%) 0px 1px 4px -1px",
//         }}
//       />
//     </form>
//   );
// }
