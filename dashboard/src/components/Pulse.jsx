import "./Pulse.css"
const Pulse = () => {
  return (
    <div className="ecg-container">
      <svg viewBox="0 0 150 60" className="ecg-line">
        <polyline
          className="heartbeat-path"
          points="0,30 7,30 15,24 22,30 30,30 37,36 42,30 46,42 51,18 55,42 60,30 67,30 75,24 82,36 90,30 97,30 105,30 112,30 120,30 127,30 135,30 142,30 150,30"
        />
        <circle className="dot" r="3">
          <animateMotion
            dur="2s"
            repeatCount="indefinite"
            fill="freeze"
            path="M0,30 L7,30 L15,24 L22,30 L30,30 L37,36 L42,30 L46,42 L51,18 L55,42 L60,30 L67,30 L75,24 L82,36 L90,30 L97,30 L105,30 L112,30 L120,30 L127,30 L135,30 L142,30 L150,30"
          >
            <mpath xlinkHref="#heartbeatPath" />
          </animateMotion>
        </circle>
        <defs></defs>
      </svg>
    </div>
  )
}

export default Pulse
