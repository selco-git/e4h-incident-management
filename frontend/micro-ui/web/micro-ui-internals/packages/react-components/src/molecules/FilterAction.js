import React from "react";
import { FilterSvg } from "../atoms/svgindex";
import RoundedLabel from "../atoms/RoundedLabel";

const FilterAction = ({ text, handleActionClick, ...props }) => (
  <div className="searchAction" onClick={handleActionClick}>
    <RoundedLabel count={props.filterCount}></RoundedLabel>
    <FilterSvg /> <span style={{color:"#7a2829"}} className="searchText">{text}</span>
  </div>
);

export default FilterAction;
