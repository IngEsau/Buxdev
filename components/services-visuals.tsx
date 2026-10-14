import type { ReactNode } from "react"
import styles from "./services-experience.module.css"

type VisualProps = { compact: boolean }

function SceneSVG({ compact, children }: VisualProps & { children: ReactNode }) {
  return <svg className={compact ? styles.mobileVisual : styles.desktopVisual}
    data-scene-art={compact ? "mobile" : "desktop"} viewBox={compact ? "0 0 480 460" : "0 0 760 600"}
    aria-hidden="true" focusable="false">{children}</svg>
}

function Node({ x, y, label, note, range, active = false, accent = false }: {
  x: number; y: number; label: string; note?: string; range: string; active?: boolean; accent?: boolean
}) {
  return <g transform={`translate(${x} ${y})`}>
    <g className={active ? styles.activate : styles.reveal} data-range={range}>
      <path className={styles.nodeCorner} d="M-14 8V-28H6" />
      <text className={`${styles.nodeLabel} ${accent ? styles.accentText : ""}`}>{label}</text>
      {note ? <text className={styles.nodeNote} y="25">{note}</text> : null}
    </g>
  </g>
}

export function FullstackVisual({ compact }: VisualProps) {
  const nodes = compact ? [
    [55, 65], [55, 165], [55, 275], [310, 275], [55, 405], [310, 405],
  ] : [
    [92, 112], [285, 238], [445, 342], [640, 224], [445, 500], [580, 450],
  ]
  const routes = compact ? [
    "M55 98V130", "M55 198V240", "M180 267H286", "M55 308V370", "M310 308V370",
  ] : [
    "M202 112H244V238H264", "M409 238H445V308", "M564 334H600V224H620", "M445 376V466", "M640 258V394H580V416",
  ]
  return <SceneSVG compact={compact}>
    <g className={styles.backLayer}>
      <path className={styles.draftLine} d={compact ? "M35 35V440M35 220H455M270 220V440" : "M72 70V560M72 290H716M260 70V560M420 70V560M600 70V560"} />
      <path className={styles.drawFaint} pathLength="1" data-range="0,0.25"
        d={compact ? "M35 35H450M35 440H450" : "M72 70H716M72 560H716"} />
    </g>
    <g className={styles.midLayer}>
      {routes.map((route, index) => <path key={route} className={styles.draw} pathLength="1" d={route}
        data-range={["0.05,0.26", "0.25,0.47", "0.46,0.65", "0.58,0.76", "0.73,0.92"][index]} />)}
      <Node x={nodes[0][0]} y={nodes[0][1]} label="CLIENT" note="INGRESS" range="-0.1,0" />
      <Node x={nodes[1][0]} y={nodes[1][1]} label="FRONTEND" note="EXPERIENCE" range="0.15,0.3" />
      <Node x={nodes[2][0]} y={nodes[2][1]} label="REST API" note="CONTRACT" range="0.35,0.5" accent />
      <Node x={nodes[3][0]} y={nodes[3][1]} label="WORKER" note="ASYNC" range="0.5,0.67" />
      <Node x={nodes[4][0]} y={nodes[4][1]} label="DATABASE" note="PERSISTENCE" range="0.63,0.8" />
      <Node x={nodes[5][0]} y={nodes[5][1]} label="EXTERNAL API" note="INTEGRATIONS" range="0.77,0.94" />
      <path className={styles.drawFaint} pathLength="1" data-range="0.86,1"
        d={compact ? "M55 440H455" : "M445 548V580H716"} />
    </g>
    <g className={styles.frontLayer}>
      <text x={compact ? 300 : 560} y={compact ? 52 : 92} className={styles.technicalLabel}>APPLICATION / LAYERS</text>
      <g className={styles.reveal} data-range="0.78,0.94">
        <path className={styles.focusLine} d={compact ? "M35 240H170M35 302H170" : "M424 300H556M424 366H556"} />
      </g>
    </g>
  </SceneSVG>
}

export function UXUIVisual({ compact }: VisualProps) {
  const x = compact ? 35 : 270
  const titleY = compact ? 192 : 228
  const inputY = compact ? 275 : 350
  const buttonY = compact ? 363 : 441
  return <SceneSVG compact={compact}>
    <g className={styles.backLayer}>
      <g className={styles.designGuides} data-range="0.6,0.92">
        <path className={styles.drawFaint} pathLength="1" data-range="0,0.18"
          d={compact ? "M35 30V440M180 30V440M310 30V440M445 30V440M15 130H465M15 245H465M15 350H465" : "M70 55V550M230 55V550M270 55V550M470 55V550M700 55V550M45 140H730M45 280H730M45 420H730"} />
      </g>
    </g>
    <g className={styles.midLayer}>
      <path className={styles.draw} pathLength="1" data-range="0.1,0.32"
        d={compact ? "M35 65H445M35 115H445M35 430H445" : "M70 125H700M230 145V525M70 540H700"} />
      <g className={styles.wireframe} data-window="0.2,0.4,0.6,0.82">
        <rect x={x} y={compact ? 145 : 170} width={compact ? 375 : 385} height="72" />
        <rect x={x} y={compact ? 260 : 330} width={compact ? 240 : 290} height="50" />
        <rect x={x} y={buttonY} width="170" height="44" />
        {!compact ? <path d="M85 180H195M85 225H195M85 270H195" /> : null}
      </g>
      <g className={styles.reveal} data-range="0.42,0.64">
        <text x={compact ? 35 : 80} y={compact ? 51 : 108} className={styles.nodeLabel}>BUXDEV</text>
        <text x={compact ? 315 : 565} y={compact ? 51 : 108} className={styles.technicalLabel}>DESIGN / SYSTEM</text>
        <text x={compact ? 35 : 80} y={compact ? 101 : 180} className={styles.interfaceNav}>Overview</text>
        <text x={compact ? 168 : 80} y={compact ? 101 : 225} className={styles.interfaceNav}>Components</text>
        <text x={compact ? 335 : 80} y={compact ? 101 : 270} className={styles.interfaceNav}>Guidelines</text>
        <path className={styles.focusLine} d={compact ? "M35 111H119" : "M80 192H190"} />
      </g>
      <g className={styles.reveal} data-range="0.58,0.84">
        <text x={x} y={titleY} className={styles.interfaceTitle}>Design system.</text>
        <text x={x} y={titleY + 39} className={styles.interfaceSubtitle}>Structure. Rhythm. Hierarchy.</text>
        <text x={x} y={inputY} className={styles.technicalLabel}>PROJECT NAME</text>
        <text x={x} y={inputY + 34} className={styles.interfaceInput}>Untitled</text>
        <path className={styles.outlineLine} d={`M${x} ${inputY + 51}h${compact ? 375 : 385}`} />
        <rect className={styles.interfaceButton} x={x} y={buttonY} width="170" height="44" />
        <text x={x + 22} y={buttonY + 28} className={styles.buttonText}>Continue</text>
      </g>
    </g>
    <g className={styles.frontLayer}>
      <g className={styles.reveal} data-range="0.68,0.94">
        <text x={compact ? 342 : 80} y={compact ? 395 : 455} className={styles.typeSpecimen}>Aa</text>
        <text x={compact ? 346 : 80} y={compact ? 419 : 491} className={styles.technicalLabel}>TYPE / SPACE</text>
      </g>
    </g>
  </SceneSVG>
}

export function SecurityVisual({ compact }: VisualProps) {
  const nodes = compact ? [[40, 125], [220, 125], [350, 225], [220, 365], [45, 365]] : [[95, 175], [335, 175], [585, 175], [335, 390], [585, 390]]
  const route = compact ? "M45 285H135V355H205" : "M95 425H225V390H319"
  const boundary = compact ? "M180 70H450V420H180Z" : "M285 100H708V494H285Z"
  return <SceneSVG compact={compact}>
    <g className={styles.backLayer}>
      <path className={styles.draftLine} d={compact ? "M25 70H455M25 420H455M150 30V440" : "M65 100H720M65 494H720M260 60V550"} />
      <g className={styles.fadeOut} data-range="0.46,0.76">
        <path className={styles.topologyLine} d={route} />
        <text x={compact ? 45 : 95} y={compact ? 303 : 448} className={styles.technicalLabel}>UNTRUSTED ROUTE</text>
      </g>
    </g>
    <g className={styles.midLayer}>
      <g className={styles.activate} data-range="0.64,0.92">
        <path className={styles.topologyLine} d={compact ? "M130 118H204M255 155V218H330M350 258V357H290M205 365H115" : "M207 167H318M469 167H568M585 208V383H465M469 390H568"} />
      </g>
      <Node x={nodes[0][0]} y={nodes[0][1]} label="CLIENT" range="0,0.12" active />
      <Node x={nodes[1][0]} y={nodes[1][1]} label="GATEWAY" note="ACCESS" range="0.58,0.84" active accent />
      <Node x={nodes[2][0]} y={nodes[2][1]} label="SERVICE" note="POLICY" range="0.64,0.92" active />
      <Node x={nodes[3][0]} y={nodes[3][1]} label="DATA" note="SCOPED" range="0.64,0.92" active />
      <Node x={nodes[4][0]} y={nodes[4][1]} label={compact ? "API" : "INTEGRATION"} range="0,0.12" active />
      <path className={styles.draw} pathLength="1" data-range="0.48,0.86" d={boundary} />
      <g className={styles.reveal} data-range="0.65,0.89">
        <text x={compact ? 190 : 295} y={compact ? 54 : 83} className={styles.technicalLabel}>AUTHORIZED SCOPE</text>
      </g>
      <g className={styles.transient} data-window="0.1,0.24,0.53,0.74">
        <path className={styles.anomalyLine} d={compact ? "M34 272h22v22H34ZM30 268l30 30M30 298l30-30" : "M84 414h22v22H84ZM80 410l30 30M80 440l30-30"} />
        <path className={styles.draw} pathLength="1" data-range="0.24,0.52" d={route} />
      </g>
    </g>
    <g className={styles.frontLayer}>
      <text x={compact ? 35 : 65} y={compact ? 35 : 70} className={styles.technicalLabel}>ACCESS / BOUNDARIES</text>
      <g className={styles.transient} data-window="0.12,0.24,0.32,0.44"><text x="35" y={compact ? 448 : 563} className={styles.traceText}>DETECT / REVIEW REQUIRED</text></g>
      <g className={styles.transient} data-window="0.32,0.42,0.54,0.66"><text x="35" y={compact ? 448 : 563} className={styles.traceText}>TRACE / ORIGIN RESOLVED</text></g>
      <g className={styles.transient} data-window="0.54,0.65,0.72,0.84"><text x="35" y={compact ? 448 : 563} className={styles.traceText}>ISOLATE / ROUTE EXCLUDED</text></g>
      <g className={styles.reveal} data-range="0.76,0.93"><text x="35" y={compact ? 448 : 563} className={styles.traceText}>HARDEN / POLICY APPLIED</text></g>
    </g>
  </SceneSVG>
}

export function AutomationVisual({ compact }: VisualProps) {
  const nodes = compact ? [[35, 50], [184, 50], [348, 50], [348, 158], [195, 246], [35, 338], [326, 338], [195, 415], [345, 440]] :
    [[70, 100], [255, 100], [445, 100], [625, 215], [440, 330], [210, 445], [610, 445], [440, 530], [625, 570]]
  const paths = compact ? [
    "M35 80H368V186H220V278", "M220 278H50V370H220V440", "M220 278H351V370H220V440", "M220 440H325",
  ] : [
    "M70 133H652V245H465V363", "M465 363H235V477H465V558", "M465 363H636V477H465V558", "M465 558H604",
  ]
  const labels = ["EVENT", "WEBHOOK", "QUEUE", "WORKER", "DECISION", "API / A", "API / B", "ACTIONS", "AUDIT"]
  const ranges = ["-0.1,0", "0.07,0.2", "0.22,0.35", "0.34,0.48", "0.45,0.6", "0.56,0.74", "0.64,0.84", "0.78,0.9", "0.86,0.95"]
  return <SceneSVG compact={compact}>
    <g className={styles.backLayer}>
      <path className={styles.draftLine} d={compact ? "M20 18H460M20 208H460M20 398H460M165 18V445" : "M45 55H728M45 293H728M45 507H728M405 55V575"} />
      <text x={compact ? 35 : 70} y={compact ? 20 : 64} className={styles.technicalLabel}>EVENT / ORCHESTRATION</text>
    </g>
    <g className={styles.midLayer}>
      {paths.map((path, index) => <g key={path}>
        <path className={styles.draftLine} d={path} />
        <path data-route-path={["main", "left", "right", "audit"][index]} className={styles.draw} pathLength="1" d={path}
          data-range={["0.04,0.56", "0.5,0.78", "0.58,0.88", "0.86,0.96"][index]} />
      </g>)}
      {nodes.map(([x, y], index) => <Node key={labels[index]} x={x} y={y} label={labels[index]} range={ranges[index]} active accent={index === 4 || index === 8} />)}
      {[
        { route: "main", travel: "0.04,0.56", window: "0.01,0.04,0.56,0.61" },
        { route: "left", travel: "0.52,0.82", window: "0.49,0.53,0.82,0.88" },
        { route: "right", travel: "0.59,0.86", window: "0.56,0.6,0.86,0.9" },
        { route: "audit", travel: "0.88,0.96", window: "0.85,0.88,0.96,0.98" },
      ].map(token => <g key={token.route} data-travel={token.travel} data-route={token.route} className={styles.transient} data-window={token.window}>
        <rect className={styles.flowToken} x="-5" y="-5" width="10" height="10" />
        <rect className={styles.flowTokenOutline} x="-10" y="-10" width="20" height="20" />
      </g>)}
    </g>
    <g className={styles.frontLayer}>
      <g className={styles.reveal} data-range="0.72,0.94">
        <text x={compact ? 250 : 560} y={compact ? 210 : 289} className={styles.technicalLabel}>WAIT / JOIN / CONTINUE</text>
      </g>
    </g>
  </SceneSVG>
}
