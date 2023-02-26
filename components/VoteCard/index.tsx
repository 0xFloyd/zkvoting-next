import React from 'react';

const VoteCard = ({ title, children }) => {
  return (
    <div className="votingCard flex flex-col">
      <div className="bg-PINK text-center p-1">
        <p className="text-darkBlue font-Laser text-3xl">{title}</p>
      </div>
      {children}
    </div>
  );
};

export default VoteCard;
