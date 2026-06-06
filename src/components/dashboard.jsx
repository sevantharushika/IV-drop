import { useEffect, useState } from "react";
import { db } from "../firebase";
import { ref, onValue } from "firebase/database";

function Dashboard() {
  const [data, setData] = useState({});

  useEffect(() => {
    const dataRef = ref(db, "ivData/current");

    onValue(dataRef, (snapshot) => {
      setData(snapshot.val());
    });
  }, []);

  return (
    <div>
      <h1>IV Monitoring Dashboard</h1>

      <p>Flow Rate: {data.flowRate}</p>
      <p>Volume: {data.volume}</p>
      <p>Status: {data.status}</p>
    </div>
  );
}

export default Dashboard;