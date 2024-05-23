import React from "react";

const ApplyFilterBar = (props) => {
  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <button  type={props.submit ? "submit" : "button"} style={{ ...props.style,color:"#7a2829" }} className="button-clear" onClick={props.onClear}>
        <header>{props.labelLink}</header>
      </button>
      <button className="submit-bar" type={props.submit ? "submit" : "button"} style={{ ...props.style, backgroundColor:"#7a2829" }} onClick={props.onSubmit}>
        <header>{props.buttonLink}</header>
      </button>
    </div>
  );
};

export default ApplyFilterBar;
