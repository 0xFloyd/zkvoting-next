import { Fragment, useState } from 'react';

export default function Modal({ open, setOpen, children }) {
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <input type="checkbox" id="my-modal-4" className="modal-toggle" checked={open} onChange={handleClose} />
      <label htmlFor="my-modal-4" className="modal cursor-pointer">
        <label className="modal-box relative" htmlFor="">
          <label htmlFor="my-modal-4" className="btn btn-sm btn-circle absolute right-2 top-2">
            ✕
          </label>
          <div className="p-2">{children}</div>
        </label>
      </label>
    </>
  );
}
