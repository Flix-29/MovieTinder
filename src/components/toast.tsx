import {useState} from "react";

export default function Toast({message, onDismiss}: { message: string, onDismiss?: () => void }) {
    const [show, setShow] = useState(true);

    if (!message || message === "") {
        return null;
    }
    return (
        <div className={show ? "block" : "hidden"} id="toast">
            <div id="toast-danger"
                 className="flex items-center fixed z-10 top-5 right-5 w-full max-w-xs p-4 mb-4 rounded-lg shadow-sm text-gray-300 bg-slate-800 border border-gray-700 border-t-red-600 border-t-4"
                 role="alert">
                <div
                    className="inline-flex items-center justify-center shrink-0 w-8 h-8 rounded-lg bg-red-800 text-red-200">
                    <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor"
                         viewBox="0 0 20 20">
                        <path
                            d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 11.793a1 1 0 1 1-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 0 1-1.414-1.414L8.586 10 6.293 7.707a1 1 0 0 1 1.414-1.414L10 8.586l2.293-2.293a1 1 0 0 1 1.414 1.414L11.414 10l2.293 2.293Z"/>
                    </svg>
                    <span className="sr-only">Error icon</span>
                </div>
                <div className="ms-3 text-sm font-normal">{message}</div>
                <button type="button"
                        onClick={() => {
                            setShow(!show)
                            if (onDismiss) {
                                onDismiss()
                            }
                        }}
                        className="ms-auto -mx-1.5 -my-1.5 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 inline-flex items-center justify-center h-8 w-8 text-gray-500 hover:text-white bg-gray-800 hover:bg-gray-700"
                        aria-label="Close">
                    <span className="sr-only">Close</span>
                    <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"
                         viewBox="0 0 14 14">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                              d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                    </svg>
                </button>
            </div>
        </div>
    )
}