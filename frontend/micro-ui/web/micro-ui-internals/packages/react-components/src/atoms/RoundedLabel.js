import React from "react";

const RoundedLabel = ({ count }) => (count ? <div style={{backgroundColor:"#7a2829"}} className="roundedLabel">{count}</div> : <React.Fragment></React.Fragment>);

export default RoundedLabel;
