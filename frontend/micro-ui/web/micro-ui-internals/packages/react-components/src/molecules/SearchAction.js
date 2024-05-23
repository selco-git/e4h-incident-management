import React from "react";
import { SearchIconSvg } from "../atoms/svgindex";

const SearchAction = ({ text, handleActionClick }) => (
  <div className="searchAction" onClick={handleActionClick} style={{color:"#7a2829"}}>
    <SearchIconSvg style={{fill:"#7a2829",color:"#7a2829"}}/> <span className="searchText">{text}</span>
  </div>
);

export default SearchAction;
