import { Fragment, useState } from 'react';

export default function Modal({ open, setOpen, children }) {
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <input type="checkbox" id="my-modal-4" className="modal-toggle" checked={open} onChange={handleClose} />
      <label htmlFor="my-modal-4" className="modal cursor-pointer">
        <label className="modal-box bg-[rgb(5,8,33)] border-2  border-PINK relative" htmlFor="">
          <label htmlFor="my-modal-4" className="hover:cursor-pointer p-2 absolute right-2 top-2">
            ✕
          </label>
          <div className="p-2">{children}</div>
        </label>
      </label>
    </>
  );
}
