import React from "react";

const MoodMeter = ({ moodLevel, type }) => {
  return (
    <div className={`meter ${type}`}>
      <div className="meter-fill" style={{ width: `${moodLevel}%` }}></div>
    </div>
  );
};

export default MoodMeter;
