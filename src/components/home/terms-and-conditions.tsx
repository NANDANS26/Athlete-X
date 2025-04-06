const TermsAndConditions = () => {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-3xl font-bold">Terms and Conditions</h1>
        <p className="mt-4 text-lg">Click the button below to view our Terms and Conditions.</p>
        <a
          href="https://www.termsfeed.com/live/dcd6ecfa-751c-4e82-acbf-9ddbc4d39948"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-700 transition"
        >
          View Terms and Conditions
        </a>
      </div>
    );
  };
  
  export default TermsAndConditions;
