import { Search, SwapVertOutlined } from "@material-ui/icons";
import { ReactElement } from "react";
import "./boqTable.scss"
import { FilterAltOutlined } from "@mui/icons-material";

function BOQTable ():ReactElement {
  return <div className="boq-container">
    <div className="boq-container--nav">
      <div className="boq-container--search">
        <input type="search" placeholder="Search"/>
        <Search />
      </div>
      <div className="boq-container--sort-n-filter">
        <button> <FilterAltOutlined/> Filter</button>
        <button> <SwapVertOutlined/> Sort</button>
      </div>
    </div>
    <div className="div boq-container--table">
        <table>
          <tr>
            <th>Bid Item Number</th>
            <th>Bid Item Description</th>
            <th>Activity Number</th>
            <th>Activity Description</th>
            <th>Quantity</th>
            <th>Unit</th>
          </tr>
          {
            (Array.from(Array(10).keys())).map((i:any) => {
              return <tr>
              <td>FPO</td>
              <td>FPO</td>
              <td>FPO</td>
              <td>FPO</td>
              <td>XX</td>
              <td>XX</td>
            </tr>
            })
          }
        </table>
      </div>
  </div>
}

export default BOQTable