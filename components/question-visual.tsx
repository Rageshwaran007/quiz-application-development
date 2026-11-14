import Image from "next/image"

function Circle({ x, y, fill = "#78a989", r = 27 }: { x: number; y: number; fill?: string; r?: number }) {
  return <circle cx={x} cy={y} r={r} fill={fill} />
}

function Square({ x, y, fill = "#e6b653", size = 52 }: { x: number; y: number; fill?: string; size?: number }) {
  return <rect x={x - size / 2} y={y - size / 2} width={size} height={size} rx="12" fill={fill} />
}

function Triangle({ x, y, fill = "#8798d3", size = 58 }: { x: number; y: number; fill?: string; size?: number }) {
  return <path d={`M ${x} ${y - size / 2} L ${x + size / 2} ${y + size / 2} L ${x - size / 2} ${y + size / 2} Z`} fill={fill} />
}

function Arrow({ x, y, angle }: { x: number; y: number; angle: number }) {
  return <path d="M 0 28 L 0 -18 M -15 -2 L 0 -19 L 15 -2" transform={`translate(${x} ${y}) rotate(${angle})`} fill="none" stroke="#43805e" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
}

function Diagram({ visualId, alt }: { visualId: string; alt: string }) {
  return (
    <svg className="diagram-svg" viewBox="0 0 600 240" role="img" aria-label={alt}>
      <rect width="600" height="240" rx="20" fill="#f4f7f2" />
      <path d="M26 201 C142 173 209 226 329 195 S 500 181 574 204" fill="none" stroke="#e6eee5" strokeWidth="2" />
      {visualId === "logic-pattern" && <g><Circle x={120} y={120} /><Square x={240} y={120} /><Circle x={360} y={120} /><Square x={480} y={120} /><path d="M550 94h30v52h-30z" fill="none" stroke="#b8c6ba" strokeDasharray="5 5" strokeWidth="3" /></g>}
      {visualId === "logic-dots" && <g>{[1, 2, 3].map((count) => <g key={count}>{Array.from({ length: count }, (_, index) => <Circle key={index} x={95 + (count - 1) * 155 + (index - (count - 1) / 2) * 32} y={120} r={10} fill="#4c8061" />)}</g>)}<rect x="500" y="90" width="62" height="60" rx="13" fill="none" stroke="#b8c6ba" strokeDasharray="5 5" strokeWidth="3" /></g>}
      {visualId === "logic-arrows" && <g><Arrow x={150} y={120} angle={0} /><Arrow x={280} y={120} angle={90} /><Arrow x={410} y={120} angle={180} /><path d="M520 92h52v56h-52z" fill="none" stroke="#b8c6ba" strokeDasharray="5 5" strokeWidth="3" /></g>}
      {visualId === "logic-sides" && <g><Triangle x={120} y={120} size={62} /><Square x={255} y={120} size={57} fill="#5c9e84" /><path d="M390 89 417 108 407 140 373 140 363 108Z" fill="#e6b653" /><path d="M510 88h58v58h-58z" fill="none" stroke="#b8c6ba" strokeDasharray="5 5" strokeWidth="3" /></g>}
      {visualId === "logic-grid" && <g>{Array.from({ length: 9 }, (_, index) => { const row = Math.floor(index / 3); const col = index % 3; const x = 220 + col * 78; const y = 46 + row * 70; const circle = (row + col) % 2 === 0; return <g key={index}>{index === 8 ? <rect x={x - 28} y={y - 25} width="56" height="50" rx="10" fill="none" stroke="#b8c6ba" strokeDasharray="4 4" strokeWidth="2" /> : circle ? <Circle x={x} y={y} r={17} /> : <Square x={x} y={y} size={34} />}</g>})}</g>}
      {visualId === "math-triangle" && <g><path d="M300 47 425 190 175 190Z" fill="#e8f1e8" stroke="#43805e" strokeWidth="6" strokeLinejoin="round" /><path d="M300 74v25h22" fill="none" stroke="#d6a63f" strokeWidth="4" /><circle cx="300" cy="47" r="7" fill="#d6a63f" /><circle cx="425" cy="190" r="7" fill="#d6a63f" /><circle cx="175" cy="190" r="7" fill="#d6a63f" /></g>}
      {visualId === "math-fraction" && <g>{[0, 1, 2, 3].map((index) => <rect key={index} x={113 + index * 96} y="83" width="86" height="74" rx="11" fill={index < 3 ? "#76a787" : "#fff"} stroke="#43805e" strokeWidth="3" />)}<path d="M105 179h388" stroke="#dbe5dc" strokeWidth="2" /></g>}
      {visualId === "math-area" && <g>{Array.from({ length: 12 }, (_, index) => { const row = Math.floor(index / 4); const col = index % 4; return <rect key={index} x={208 + col * 48} y={57 + row * 48} width="48" height="48" fill={(row + col) % 2 === 0 ? "#dcebdd" : "#eff5ee"} stroke="#6c9c77" strokeWidth="2" rx="3" />})}<text x="300" y="43" textAnchor="middle" fill="#55745d" fontSize="18" fontWeight="700">4 units</text><text x="420" y="130" fill="#55745d" fontSize="18" fontWeight="700">3 units</text></g>}
      {visualId === "math-chart" && <g><path d="M140 185h330M160 185V58" stroke="#7e9582" strokeWidth="3" /><rect x="205" y="116" width="54" height="69" rx="8" fill="#87af90" /><rect x="300" y="68" width="54" height="117" rx="8" fill="#e3b453" /><rect x="395" y="138" width="54" height="47" rx="8" fill="#94a3d2" /><text x="232" y="211" textAnchor="middle" fill="#728276" fontSize="15">A</text><text x="327" y="211" textAnchor="middle" fill="#728276" fontSize="15">B</text><text x="422" y="211" textAnchor="middle" fill="#728276" fontSize="15">C</text><text x="232" y="106" textAnchor="middle" fill="#53695a" fontSize="14">3</text><text x="327" y="58" textAnchor="middle" fill="#53695a" fontSize="14">5</text><text x="422" y="128" textAnchor="middle" fill="#53695a" fontSize="14">2</text></g>}
      {visualId === "math-clock" && <g><circle cx="300" cy="120" r="81" fill="#fff" stroke="#43805e" strokeWidth="6" />{Array.from({ length: 12 }, (_, i) => { const angle = (i * Math.PI) / 6; return <circle key={i} cx={300 + Math.sin(angle) * 64} cy={120 - Math.cos(angle) * 64} r="4" fill="#819885" />})}<path d="M300 120V58M300 120h57" stroke="#356d51" strokeWidth="8" strokeLinecap="round" /><circle cx="300" cy="120" r="8" fill="#dfa93c" /></g>}
    </svg>
  )
}

export function QuestionVisual({ image, visualId, alt }: { image?: string; visualId?: string; alt?: string }) {
  if (image) return <Image className="question-visual-image" src={image} alt={alt ?? "Quiz illustration"} width={900} height={600} priority />
  if (visualId) return <Diagram visualId={visualId} alt={alt ?? "Question diagram"} />
  return null
}
