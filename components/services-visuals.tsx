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
    [45, 80], [45, 180], [45, 285], [290, 285], [45, 410], [270, 410],
  ] : [
    [70, 110], [270, 220], [430, 340], [620, 220], [430, 510], [580, 470],
  ]
  const routes = compact ? [
    "M45 98V142", "M45 198V247", "M187 277H266", "M45 303V372", "M290 303V350H270V372",
  ] : [
    "M182 103H235V212H246", "M320 262V290H430V306", "M554 332H590V212H600", "M430 380V476", "M672 262V412H580V436",
  ]
  return <SceneSVG compact={compact}>
    <g className={styles.backLayer}>
      <path className={styles.drawFaint} pathLength="1" data-range="0,0.25"
        d={compact ? "M25 450H455" : "M42 64H738M42 564H738"} />
    </g>
    <g className={styles.midLayer}>
      {routes.map((route, index) => <path key={route} className={styles.draw} pathLength="1" d={route}
        data-range={["0.05,0.26", "0.25,0.47", "0.46,0.65", "0.58,0.76", "0.73,0.92"][index]} />)}
      <Node x={nodes[0][0]} y={nodes[0][1]} label="CLIENT" note={compact ? undefined : "INGRESS"} range="-0.1,0" />
      <Node x={nodes[1][0]} y={nodes[1][1]} label="FRONTEND" note={compact ? undefined : "EXPERIENCE"} range="0.15,0.3" />
      <Node x={nodes[2][0]} y={nodes[2][1]} label="REST API" note={compact ? undefined : "CONTRACT"} range="0.35,0.5" accent />
      <Node x={nodes[3][0]} y={nodes[3][1]} label="WORKER" note={compact ? undefined : "ASYNC"} range="0.5,0.67" />
      <Node x={nodes[4][0]} y={nodes[4][1]} label="DATABASE" note={compact ? undefined : "PERSISTENCE"} range="0.63,0.8" />
      <Node x={nodes[5][0]} y={nodes[5][1]} label="EXTERNAL API" note={compact ? undefined : "INTEGRATIONS"} range="0.77,0.94" />
    </g>
    <g className={styles.frontLayer}>
      <text x={compact ? 45 : 70} y={compact ? 28 : 45} className={styles.technicalLabel}>APPLICATION / LAYERS</text>
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
          d={compact ? "M15 130H465M15 445H465" : "M45 140H730M45 550H730M230 145V525"} />
      </g>
    </g>
    <g className={styles.midLayer}>
      <path className={styles.draw} pathLength="1" data-range="0.1,0.32"
        d={compact ? "M35 65H445M35 115H445M35 455H445" : "M70 125H700M230 145V525M70 540H700"} />
      <g className={styles.wireframe} data-window="0.16,0.34,0.42,0.58">
        <rect x={x - 16} y={compact ? 145 : 170} width={compact ? 407 : 417} height={compact ? 110 : 118} />
        <rect x={x - 16} y={inputY - 17} width={compact ? 272 : 322} height="72" />
        <rect x={x} y={buttonY} width="170" height="44" />
        {!compact ? <path d="M85 198H195M85 243H195M85 288H195" /> : null}
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
        <text x={compact ? 346 : 80} y={compact ? 431 : 491} className={styles.technicalLabel}>TYPE / SPACE</text>
      </g>
    </g>
  </SceneSVG>
}

export function SecurityVisual({ compact }: VisualProps) {
  const nodes = compact ? [[45, 125], [230, 125], [330, 245], [230, 385], [45, 385]] : [[80, 175], [310, 175], [570, 175], [310, 400], [550, 400]]
  const route = compact ? "M45 300H135V377H206" : "M80 435H210V392H286"
  const boundary = compact ? "M200 70H462V425H200Z" : "M270 100H740V500H270Z"
  return <SceneSVG compact={compact}>
    <g className={styles.backLayer}>
      <g className={styles.fadeOut} data-range="0.46,0.76">
        <path className={styles.topologyLine} d={route} />
        <text x={compact ? 45 : 80} y={compact ? 265 : 470} className={styles.technicalLabel}>UNTRUSTED ROUTE</text>
      </g>
    </g>
    <g className={styles.midLayer}>
      <g className={styles.activate} data-range="0.64,0.92">
        <path className={styles.topologyLine} d={compact ? "M145 117H206M285 146V192H330V211M330 266V330H230V351M135 377H206" : "M192 167H286M456 167H546M570 215V310H310V366M412 392H526"} />
      </g>
      <Node x={nodes[0][0]} y={nodes[0][1]} label="CLIENT" range="0,0.12" active />
      <Node x={nodes[1][0]} y={nodes[1][1]} label="GATEWAY" note={compact ? undefined : "ACCESS"} range="0.58,0.84" active accent />
      <Node x={nodes[2][0]} y={nodes[2][1]} label="SERVICE" note={compact ? undefined : "POLICY"} range="0.64,0.92" active />
      <Node x={nodes[3][0]} y={nodes[3][1]} label="DATA" note={compact ? undefined : "SCOPED"} range="0.64,0.92" active />
      <Node x={nodes[4][0]} y={nodes[4][1]} label={compact ? "API" : "INTEGRATION"} range="0,0.12" active />
      <path className={styles.draw} pathLength="1" data-range="0.48,0.86" d={boundary} />
      <g className={styles.reveal} data-range="0.65,0.89">
        <text x={compact ? 210 : 295} y={compact ? 54 : 83} className={styles.technicalLabel}>AUTHORIZED SCOPE</text>
      </g>
      <g className={styles.transient} data-window="0.1,0.24,0.53,0.74">
        <path className={styles.anomalyLine} d={compact ? "M34 289h22v22H34ZM30 285l30 30M30 315l30-30" : "M69 424h22v22H69ZM65 420l30 30M65 450l30-30"} />
        <path className={styles.draw} pathLength="1" data-range="0.24,0.52" d={route} />
      </g>
    </g>
    <g className={styles.frontLayer}>
      <text x={compact ? 35 : 65} y={compact ? 35 : 70} className={styles.technicalLabel}>ACCESS / BOUNDARIES</text>
      <g className={styles.transient} data-window="0.08,0.16,0.22,0.28"><text x="35" y={compact ? 454 : 563} className={styles.traceText}>DETECT / REVIEW REQUIRED</text></g>
      <g className={styles.transient} data-window="0.28,0.36,0.43,0.49"><text x="35" y={compact ? 454 : 563} className={styles.traceText}>TRACE / ORIGIN RESOLVED</text></g>
      <g className={styles.transient} data-window="0.49,0.57,0.65,0.71"><text x="35" y={compact ? 454 : 563} className={styles.traceText}>ISOLATE / ROUTE EXCLUDED</text></g>
      <g className={styles.transient} data-range="0.71,0.86"><text x="35" y={compact ? 454 : 563} className={styles.traceText}>HARDEN / POLICY APPLIED</text></g>
    </g>
  </SceneSVG>
}

export function AutomationVisual({ compact }: VisualProps) {
  const nodes = compact ? [[35, 60], [190, 60], [355, 60], [300, 160], [170, 255], [50, 350], [330, 350], [170, 420], [355, 440]] :
    [[65, 100], [270, 100], [535, 100], [600, 235], [350, 320], [135, 425], [590, 425], [350, 520], [625, 560]]
  const paths = compact ? [
    "M35 90H440V188H312V220H145V285H170", "M170 285H25V378H145V444H170", "M170 285H305V444H170", "M170 444H330",
  ] : [
    "M65 135H560V260H600V285H325V350H350", "M350 350H110V455H325V546H350", "M350 350H565V455H475V546H350", "M350 546H604",
  ]
  const labels = ["EVENT", "WEBHOOK", "QUEUE", "WORKER", "DECISION", "API / A", "API / B", "ACTIONS", "AUDIT"]
  const ranges = ["-0.1,0", "0.07,0.2", "0.22,0.35", "0.34,0.48", "0.45,0.6", "0.56,0.74", "0.64,0.84", "0.78,0.9", "0.86,0.95"]
  return <SceneSVG compact={compact}>
    <g className={styles.backLayer}>
      <text x={compact ? 35 : 65} y={compact ? 20 : 45} className={styles.technicalLabel}>EVENT / ORCHESTRATION</text>
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
        <text x={compact ? 35 : 70} y={compact ? 200 : 300} className={styles.technicalLabel}>WAIT / JOIN / CONTINUE</text>
      </g>
    </g>
  </SceneSVG>
}
