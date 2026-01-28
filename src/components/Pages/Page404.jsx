import React from "react";

const NotFound = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center bg-slate-50 p-4">
            <img
                src="404_NotFound.png"
                alt="not found"
                className="w-full max-w-xs object-contain mb-6"

            />

            <p className="text-xl font-semibold">Bạn không thể truy cập 🚫</p>

            <a
                href="/"
                className="inline-block px-6 py-3 mt-6 font-medium text-white transition shadow-md bg-primary rounded-2xl hover:bg-primary-dark"
            >
                Quay về trang chủ
            </a>
        </div>
    );
};

export default NotFound;
