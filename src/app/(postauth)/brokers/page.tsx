"use client"
import BytesPerSecond from "@components/BrokersBytesInGraph";

const Brokers = () => {

  return (
    <div className="flex-column">
      <p className="text-center text-4xl font-bold">Metrics</p>
      <div className="m-10"></div>
      <div className="flex justify-center">
        <BytesPerSecond/>
      </div>
    </div>
  )
}

export default Brokers;