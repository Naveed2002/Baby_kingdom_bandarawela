import React, { useEffect, useState } from 'react';

const TestComponent = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    // BUG 1: Potential memory leak (missing cleanup)
    const interval = setInterval(() => {
      console.log("Fetching data...");
    }, 1000);

    // SECURITY RISK: Hardcoded sensitive information (Mock)
    const apiKey = "AKIA6O5EXAMPLE_SECRET_KEY"; 
    
    // BUG 2: Using dangerouslySetInnerHTML without sanitization
    const rawHtml = "<div onclick='alert(\"XSS\")'>Click me</div>";

    return (
      <div dangerouslySetInnerHTML={{ __html: rawHtml }} />
    );
  }, []);

  return <div>Check the console for leaks!</div>;
};

export default TestComponent;
